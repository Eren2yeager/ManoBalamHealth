import { Server, Socket } from "socket.io";
import redis from "@/config/redis";
import { SocketEvents } from "../events";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";
import { logger } from "@/utils/logger";

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    role: string;
  };
}

/**
 * Seconds a psychologist may be fully disconnected (refresh, page navigation,
 * flaky network) before patients see them go offline. Reconnecting within the
 * window cancels the pending offline transition.
 */
const OFFLINE_GRACE_SECONDS = 60;

const graceKey = (psychologistId: string) => `presence:grace:${psychologistId}`;

async function setPsychologistOnline(io: Server, psychologist: any, online: boolean) {
  const psychologistId = psychologist._id.toString();
  const changed = psychologist.isOnline !== online;
  psychologist.isOnline = online;
  await psychologist.save();
  if (online) {
    await redis.sadd("psychologists:online", psychologistId);
  } else {
    await redis.srem("psychologists:online", psychologistId);
  }
  if (changed) {
    io.emit(SocketEvents.PRESENCE_UPDATE, { psychologistId, isOnline: online });
  }
}

export const handlePresence = (io: Server, socket: AuthenticatedSocket) => {
  if (!socket.user) return;

  const userId = socket.user.userId;
  const role = socket.user.role;

  // When user connects
  const handleConnect = async () => {
    // Store user's socket ID in Redis
    await redis.sadd(`user:sockets:${userId}`, socket.id);
    const socketCount = await redis.scard(`user:sockets:${userId}`);
    if (socketCount === 1) {
      io.emit(SocketEvents.USER_ONLINE, { userId });
    }

    // Restore the psychologist's chosen availability: a reconnect within the
    // grace window (or a fresh session with intent still on) puts them back
    // online without requiring another toggle.
    if (role === "psychologist") {
      const psychologist = await PsychologistModel.findOne({ userId });
      if (
        psychologist &&
        psychologist.verificationStatus === "approved" &&
        psychologist.onboardingStatus === "approved"
      ) {
        await redis.del(graceKey(psychologist._id.toString()));
        if (psychologist.presenceIntendedOnline && !psychologist.isOnline) {
          await setPsychologistOnline(io, psychologist, true);
        }
        socket.emit("presence:state", {
          isOnline: psychologist.isOnline,
          intendedOnline: psychologist.presenceIntendedOnline,
        });
      }
    }
  };

  // When user disconnects
  const handleDisconnect = async () => {
    // Remove this socket ID
    await redis.srem(`user:sockets:${userId}`, socket.id);

    // Check if user has any remaining sockets
    const remainingSockets = await redis.scard(`user:sockets:${userId}`);
    if (remainingSockets === 0) {
      // User is Offline
      await redis.del(`user:sockets:${userId}`);
      io.emit(SocketEvents.USER_OFFLINE, { userId });

      // Psychologists get a grace window before patients see them offline,
      // so refreshes and navigation don't flicker their status.
      if (role === "psychologist") {
        const psychologist = await PsychologistModel.findOne({ userId });
        if (psychologist && psychologist.isOnline) {
          const key = graceKey(psychologist._id.toString());
          await redis.set(key, "1", "EX", OFFLINE_GRACE_SECONDS);
          setTimeout(async () => {
            try {
              const [stillDisconnected, gracePending] = await Promise.all([
                redis.scard(`user:sockets:${userId}`).then((count) => count === 0),
                redis.exists(key).then((exists) => exists === 1),
              ]);
              if (!stillDisconnected || !gracePending) return;
              await redis.del(key);
              const current = await PsychologistModel.findOne({ userId });
              if (current && current.isOnline) {
                // Intent is preserved: they go back online automatically on reconnect.
                await setPsychologistOnline(io, current, false);
              }
            } catch (error) {
              logger.error("Presence grace-period check failed", {
                error,
                metadata: { userId },
              });
            }
          }, OFFLINE_GRACE_SECONDS * 1000);
        }
      }
    }
  };

  // Register handlers
  handleConnect();
  socket.on("presence:set", async (payload: { online?: boolean }) => {
    if (role !== "psychologist") return;
    const psychologist = await PsychologistModel.findOne({ userId });
    if (
      !psychologist ||
      psychologist.verificationStatus !== "approved" ||
      psychologist.onboardingStatus !== "approved"
    ) {
      socket.emit("presence:error", { message: "Psychologist approval is required" });
      return;
    }
    const online = payload?.online === true;
    await redis.del(graceKey(psychologist._id.toString()));
    psychologist.presenceIntendedOnline = online;
    await setPsychologistOnline(io, psychologist, online);
    socket.emit("presence:state", {
      isOnline: online,
      intendedOnline: online,
    });
  });
  socket.on("disconnect", handleDisconnect);
};
