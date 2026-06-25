import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "./middleware/socketAuth.middleware";
import { handlePresence } from "./handlers/presence.handler";
import { handleSessionPresence } from "./handlers/sessionPresence.handler";
import { handleChat } from "./handlers/chat.handler";
import { handleWebRTCSignaling } from "./handlers/webrtcSignaling.handler";
import { handleEmergency } from "./handlers/emergency.handler";
import { env } from "@/config/env";
import { sessionLifecycleService } from "@/modules/session/sessionLifecycle.service";

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    role: string;
  };
}

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    },
  });

  // Apply auth middleware
  io.use(socketAuthMiddleware);
  sessionLifecycleService.initialize(io);

  io.on("connection", async (socket: AuthenticatedSocket) => {
    if (!socket.user) return;

    // Join the user's own room so we can send events directly to them
    const userRoom = `user:${socket.user.userId}`;
    await socket.join(userRoom);
    console.log(`[SOCKET] User ${socket.user.userId} (role: ${socket.user.role}) joined room ${userRoom}`);

    // Handle presence
    handlePresence(io, socket);
    handleSessionPresence(io, socket);

    // Handle chat
    handleChat(io, socket);

    // Handle WebRTC signaling
    handleWebRTCSignaling(io, socket);

    // Handle emergency
    handleEmergency(io, socket);
  });

  return io;
};
