import { Server, Socket } from "socket.io";
import redis from "@/config/redis";
import { SessionModel } from "@/modules/session/session.model";
import { AppointmentModel } from "@/modules/appointment/appointment.model";
import { sessionLifecycleService } from "@/modules/session/sessionLifecycle.service";

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    role: string;
  };
}

const getAuthorizedSession = async (sessionId: string, userId: string) => {
  const session = await SessionModel.findById(sessionId).populate("appointmentId");
  if (!session) return null;

  const appointment = await AppointmentModel.findById((session.appointmentId as any)._id)
    .populate("patientId")
    .populate("psychologistId");
  if (!appointment) return null;

  await (appointment as any).populate("psychologistId.userId");

  const apptAny = appointment as any;
  const patientUserId = apptAny.patientId._id.toString();
  const psychologistUserId = apptAny.psychologistId.userId._id.toString();

  if (userId !== patientUserId && userId !== psychologistUserId) {
    return null;
  }

  return {
    sessionId: session._id.toString(),
    patientUserId,
    psychologistUserId,
  };
};

const buildPresencePayload = async (
  sessionId: string,
  patientUserId: string,
  psychologistUserId: string,
) => {
  const [patientCount, psychologistCount] = await Promise.all([
    redis.scard(`session:${sessionId}:user:${patientUserId}:sockets`),
    redis.scard(`session:${sessionId}:user:${psychologistUserId}:sockets`),
  ]);

  return {
    sessionId,
    patientUserId,
    psychologistUserId,
    patientOnline: patientCount > 0,
    psychologistOnline: psychologistCount > 0,
  };
};

export const handleSessionPresence = (io: Server, socket: AuthenticatedSocket) => {
  if (!socket.user) return;

  const userId = socket.user.userId;
  const joinedSessions = new Set<string>();

  const joinSessionPresence = async (payload: { sessionId: string }) => {
    const sessionId = payload?.sessionId;
    if (!sessionId) return;

    const authorized = await getAuthorizedSession(sessionId, userId);
    if (!authorized) return;

    joinedSessions.add(sessionId);
    socket.join(`session-presence:${sessionId}`);
    await redis.sadd(`session:${sessionId}:user:${userId}:sockets`, socket.id);

    const presence = await buildPresencePayload(
      sessionId,
      authorized.patientUserId,
      authorized.psychologistUserId,
    );

    io.to(`session-presence:${sessionId}`).emit("session:presence:update", presence);
    await sessionLifecycleService.reconcileSession(sessionId, io);
  };

  const leaveSessionPresence = async (payload: { sessionId: string }) => {
    const sessionId = payload?.sessionId;
    if (!sessionId) return;

    const authorized = await getAuthorizedSession(sessionId, userId);
    if (!authorized) return;

    joinedSessions.delete(sessionId);
    socket.leave(`session-presence:${sessionId}`);
    await redis.srem(`session:${sessionId}:user:${userId}:sockets`, socket.id);

    const remaining = await redis.scard(`session:${sessionId}:user:${userId}:sockets`);
    if (remaining === 0) {
      await redis.del(`session:${sessionId}:user:${userId}:sockets`);
    }

    const presence = await buildPresencePayload(
      sessionId,
      authorized.patientUserId,
      authorized.psychologistUserId,
    );

    io.to(`session-presence:${sessionId}`).emit("session:presence:update", presence);
    await sessionLifecycleService.reconcileSession(sessionId, io);
  };

  const handleDisconnect = async () => {
    for (const sessionId of joinedSessions) {
      const authorized = await getAuthorizedSession(sessionId, userId);
      if (!authorized) continue;

      await redis.srem(`session:${sessionId}:user:${userId}:sockets`, socket.id);
      const remaining = await redis.scard(`session:${sessionId}:user:${userId}:sockets`);
      if (remaining === 0) {
        await redis.del(`session:${sessionId}:user:${userId}:sockets`);
      }

      const presence = await buildPresencePayload(
        sessionId,
        authorized.patientUserId,
        authorized.psychologistUserId,
      );

      io.to(`session-presence:${sessionId}`).emit("session:presence:update", presence);
      await sessionLifecycleService.reconcileSession(sessionId, io);
    }
  };

  socket.on("session:presence:join", joinSessionPresence);
  socket.on("session:presence:leave", leaveSessionPresence);
  socket.on("disconnect", handleDisconnect);
};
