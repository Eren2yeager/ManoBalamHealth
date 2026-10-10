import { Server, Socket } from "socket.io";
import { SessionModel } from "@/modules/session/session.model";
import { AppointmentModel } from "@/modules/appointment/appointment.model";
import { sessionLifecycleService } from "@/modules/session/sessionLifecycle.service";

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    role: string;
  };
}

export const handleWebRTCSignaling = (io: Server, socket: AuthenticatedSocket) => {
  if (!socket.user) return;

  const userId = socket.user.userId;

  const getAuthorizedSession = async (sessionId: string) => {
    const session = await SessionModel.findById(sessionId).populate("appointmentId");
    if (!session) return null;

    const appointment = session.appointmentId as any;
    if (!appointment) return null;

    const fullAppointment = await AppointmentModel.findById(appointment._id)
      .populate("patientId")
      .populate("psychologistId");
    if (!fullAppointment) return null;

    await (fullAppointment as any).populate("psychologistId.userId");

    const apptAny = fullAppointment as any;
    const isParticipant =
      apptAny.patientId._id.toString() === userId ||
      apptAny.psychologistId.userId._id.toString() === userId;

    if (!isParticipant) return null;

    return { session, appointment: fullAppointment };
  };

  // Join a WebRTC room for the session
  const handleJoinRoom = async (payload: string | { sessionId: string }) => {
    const sessionId =
      typeof payload === "string" ? payload : payload?.sessionId;
    if (!sessionId) return;

    const authorized = await getAuthorizedSession(sessionId);
    if (!authorized) return;

    socket.join(`webrtc:${sessionId}`);
  };

  // Handle leaving a WebRTC room
  const handleLeaveRoom = async (payload: string | { sessionId: string }) => {
    const sessionId =
      typeof payload === "string" ? payload : payload?.sessionId;
    if (!sessionId) return;
    socket.leave(`webrtc:${sessionId}`);
  };

  const ensureSessionIsLive = async (sessionId: string) => {
    const authorized = await getAuthorizedSession(sessionId);
    if (!authorized) return false;

    await sessionLifecycleService.reconcileSession(sessionId, io);
    return sessionLifecycleService.canUseLiveSessionFeatures(sessionId);
  };

  const handleOffer = async (data: {
    sessionId: string;
    sdp: Record<string, unknown>;
  }) => {
    const authorized = await getAuthorizedSession(data.sessionId);
    if (!authorized) return;

    socket.join(`webrtc:${data.sessionId}`);
    const canUseLiveFeatures = await ensureSessionIsLive(data.sessionId);
    if (!canUseLiveFeatures) return;

    socket.to(`webrtc:${data.sessionId}`).emit("webrtc:offer", {
      sdp: data.sdp,
      fromUserId: userId,
    });
  };

  const handleAnswer = async (data: {
    sessionId: string;
    sdp: Record<string, unknown>;
  }) => {
    const authorized = await getAuthorizedSession(data.sessionId);
    if (!authorized) return;

    socket.join(`webrtc:${data.sessionId}`);
    const canUseLiveFeatures = await ensureSessionIsLive(data.sessionId);
    if (!canUseLiveFeatures) return;

    socket.to(`webrtc:${data.sessionId}`).emit("webrtc:answer", {
      sdp: data.sdp,
      fromUserId: userId,
    });
  };

  // Handle sending an ICE candidate
  const handleIceCandidate = async (data: {
    sessionId: string;
    candidate: Record<string, unknown>;
  }) => {
    const authorized = await getAuthorizedSession(data.sessionId);
    if (!authorized) return;

    socket.join(`webrtc:${data.sessionId}`);
    const canUseLiveFeatures = await ensureSessionIsLive(data.sessionId);
    if (!canUseLiveFeatures) return;

    socket.to(`webrtc:${data.sessionId}`).emit("webrtc:ice-candidate", {
      candidate: data.candidate,
      fromUserId: userId,
    });
  };

  const handleEndCall = async (data: { sessionId: string }) => {
    const authorized = await getAuthorizedSession(data.sessionId);
    if (!authorized) return;

    socket.to(`webrtc:${data.sessionId}`).emit("webrtc:call-ended");
    socket.leave(`webrtc:${data.sessionId}`);
  };

  // Register event listeners
  socket.on("webrtc:join", handleJoinRoom);
  socket.on("webrtc:leave", handleLeaveRoom);
  socket.on("webrtc:offer", handleOffer);
  socket.on("webrtc:answer", handleAnswer);
  socket.on("webrtc:ice-candidate", handleIceCandidate);
  socket.on("webrtc:end-call", handleEndCall);
};
