import { Server, Socket } from "socket.io";
import redis from "@/config/redis";
import { SocketEvents } from "../events";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    role: string;
  };
}

export const handlePresence = (io: Server, socket: AuthenticatedSocket) => {
  if (!socket.user) return;

  const userId = socket.user.userId;
  const role = socket.user.role;

  // When user connects
  const handleConnect = async () => {
    // Store user's socket ID in Redis
    await redis.sadd(`user:sockets:${userId}`, socket.id);

  };

  // When user disconnects
  const handleDisconnect = async () => {
    // Remove this socket ID
    await redis.srem(`user:sockets:${userId}`, socket.id);

    // Check if user has any remaining sockets
    const remainingSockets = await redis.scard(`user:sockets:${userId}`);
    if (remainingSockets === 0) {
      // User is offline
      await redis.del(`user:sockets:${userId}`);

      // If psychologist, update isOnline and remove from online set
      if (role === "psychologist") {
        const psychologist = await PsychologistModel.findOne({ userId });
        if (psychologist) {
          psychologist.isOnline = false;
          await psychologist.save();
          await redis.srem("psychologists:online", psychologist._id.toString());
          io.emit(SocketEvents.PRESENCE_UPDATE, {
            psychologistId: psychologist._id.toString(),
            isOnline: false,
          });
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
    psychologist.isOnline = online;
    await psychologist.save();
    if (online) {
      await redis.sadd("psychologists:online", psychologist._id.toString());
    } else {
      await redis.srem("psychologists:online", psychologist._id.toString());
    }
    io.emit(SocketEvents.PRESENCE_UPDATE, {
      psychologistId: psychologist._id.toString(),
      isOnline: online,
    });
  });
  socket.on("disconnect", handleDisconnect);
};
