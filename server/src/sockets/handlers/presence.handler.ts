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

    // If user is a psychologist, update isOnline status and add to online set
    if (role === "psychologist") {
      const psychologist = await PsychologistModel.findOne({ userId });
      if (psychologist) {
        psychologist.isOnline = true;
        await psychologist.save();
        await redis.sadd("psychologists:online", psychologist._id.toString());
      }
    }

    // Emit presence update
    io.emit(SocketEvents.PRESENCE_UPDATE, {
      userId,
      role,
      online: true,
    });
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
        }
      }

      // Emit presence update
      io.emit(SocketEvents.PRESENCE_UPDATE, {
        userId,
        role,
        online: false,
      });
    }
  };

  // Register handlers
  handleConnect();
  socket.on("disconnect", handleDisconnect);
};
