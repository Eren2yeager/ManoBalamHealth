import { Server, Socket } from "socket.io";
import { SessionModel } from "@/modules/session/session.model";
import {
  extractSessionId,
  getSessionParticipants,
  safeHandler,
} from "@/sockets/utils/sessionAuth";

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    role: string;
  };
}

const roomOf = (sessionId: string) => `webrtc:${sessionId}`;

/**
 * Signaling protocol (1:1 calls, perfect-negotiation friendly):
 *
 * emit from client:
 *   webrtc:join          { sessionId }            → ack via "webrtc:room-peers"
 *   webrtc:leave         { sessionId }
 *   webrtc:description   { sessionId, description }  (offer OR answer SDP)
 *   webrtc:ice-candidate { sessionId, candidate }
 *
 * emitted to clients:
 *   webrtc:room-peers    { sessionId, userIds }   — sent to the joiner
 *   webrtc:peer-joined   { sessionId, userId }    — sent to others in room
 *   webrtc:peer-left     { sessionId, userId }    — on leave/disconnect
 *   webrtc:description   { description, fromUserId }
 *   webrtc:ice-candidate { candidate, fromUserId }
 *
 * Legacy events (webrtc:offer / webrtc:answer / webrtc:call-ended) are kept
 * for backwards compatibility with older clients.
 */
export const handleWebRTCSignaling = (io: Server, socket: AuthenticatedSocket) => {
  if (!socket.user) return;

  const userId = socket.user.userId;

  const listPeers = async (sessionId: string): Promise<string[]> => {
    const sockets = await io.in(roomOf(sessionId)).fetchSockets();
    const ids = new Set<string>();
    for (const s of sockets) {
      const uid = (s as unknown as AuthenticatedSocket).user?.userId
        ?? (s.data as { userId?: string } | undefined)?.userId;
      if (uid && uid !== userId) ids.add(uid);
    }
    return [...ids];
  };

  // Join is the single authorization point: participant check + session not
  // ended. Presence of BOTH users is NOT required to join — the room is a
  // rendezvous point, and peers learn about each other via peer-joined.
  const handleJoinRoom = safeHandler("webrtc:join", async (payload: unknown) => {
    const sessionId = extractSessionId(payload);
    if (!sessionId) return;

    const participants = await getSessionParticipants(sessionId);
    if (!participants) return;
    if (
      participants.patientUserId !== userId &&
      participants.psychologistUserId !== userId
    ) {
      return;
    }

    const session = await SessionModel.findById(sessionId).select("status").lean();
    if (!session || session.status === "ended") return;

    // Expose userId on socket.data so fetchSockets() works across processes.
    socket.data.userId = userId;
    await socket.join(roomOf(sessionId));

    const peers = await listPeers(sessionId);
    socket.emit("webrtc:room-peers", { sessionId, userIds: peers });
    socket.to(roomOf(sessionId)).emit("webrtc:peer-joined", { sessionId, userId });
  });

  const leaveRoom = async (sessionId: string) => {
    if (!socket.rooms.has(roomOf(sessionId))) return;
    await socket.leave(roomOf(sessionId));
    socket.to(roomOf(sessionId)).emit("webrtc:peer-left", { sessionId, userId });
  };

  const handleLeaveRoom = safeHandler("webrtc:leave", async (payload: unknown) => {
    const sessionId = extractSessionId(payload);
    if (!sessionId) return;
    await leaveRoom(sessionId);
  });

  // Relays require membership in the room (authorized at join). No DB hits.
  const relay = (
    event: string,
    buildPayload: (data: any) => Record<string, unknown> | null,
  ) =>
    safeHandler(event, async (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const sessionId = extractSessionId(data);
      if (!sessionId) return;
      if (!socket.rooms.has(roomOf(sessionId))) return;

      const payload = buildPayload(data);
      if (!payload) return;

      socket.to(roomOf(sessionId)).emit(event, { ...payload, fromUserId: userId });
    });

  const handleDescription = relay("webrtc:description", (data) => {
    const description = data.description;
    if (
      !description ||
      typeof description !== "object" ||
      (description.type !== "offer" && description.type !== "answer" && description.type !== "rollback")
    ) {
      return null;
    }
    return { description };
  });

  // Mic/camera on-off state so the peer can render an avatar tile instead of
  // a black video frame (disabled tracks still deliver frames).
  const handleMediaState = relay("webrtc:media-state", (data) => ({
    micOn: Boolean(data.micOn),
    cameraOn: Boolean(data.cameraOn),
  }));

  const handleIceCandidate = relay("webrtc:ice-candidate", (data) =>
    data.candidate && typeof data.candidate === "object"
      ? { candidate: data.candidate }
      : null,
  );

  // Legacy offer/answer relay for older clients.
  const handleLegacyOffer = relay("webrtc:offer", (data) =>
    data.sdp && typeof data.sdp === "object" ? { sdp: data.sdp } : null,
  );
  const handleLegacyAnswer = relay("webrtc:answer", (data) =>
    data.sdp && typeof data.sdp === "object" ? { sdp: data.sdp } : null,
  );

  const handleEndCall = safeHandler("webrtc:end-call", async (data: unknown) => {
    const sessionId = extractSessionId(data);
    if (!sessionId) return;
    if (!socket.rooms.has(roomOf(sessionId))) return;

    socket.to(roomOf(sessionId)).emit("webrtc:call-ended");
    await leaveRoom(sessionId);
  });

  // Notify rooms BEFORE the socket is removed from them (disconnecting fires
  // while socket.rooms is still populated).
  const handleDisconnecting = safeHandler("disconnecting", async () => {
    for (const room of socket.rooms) {
      if (!room.startsWith("webrtc:")) continue;
      const sessionId = room.slice("webrtc:".length);
      socket.to(room).emit("webrtc:peer-left", { sessionId, userId });
    }
  });

  socket.on("webrtc:join", handleJoinRoom);
  socket.on("webrtc:leave", handleLeaveRoom);
  socket.on("webrtc:description", handleDescription);
  socket.on("webrtc:ice-candidate", handleIceCandidate);
  socket.on("webrtc:media-state", handleMediaState);
  socket.on("webrtc:offer", handleLegacyOffer);
  socket.on("webrtc:answer", handleLegacyAnswer);
  socket.on("webrtc:end-call", handleEndCall);
  socket.on("disconnecting", handleDisconnecting);
};
