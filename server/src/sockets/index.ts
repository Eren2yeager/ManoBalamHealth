import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "./middleware/socketAuth.middleware";
import { handlePresence } from "./handlers/presence.handler";
import { handleChat } from "./handlers/chat.handler";
import { handleWebRTCSignaling } from "./handlers/webrtcSignaling.handler";
import { handleEmergency } from "./handlers/emergency.handler";
import { env } from "@/config/env";

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

  io.on("connection", (socket: AuthenticatedSocket) => {
    if (!socket.user) return;

    // Handle presence
    handlePresence(io, socket);

    // Handle chat
    handleChat(io, socket);

    // Handle WebRTC signaling
    handleWebRTCSignaling(io, socket);

    // Handle emergency
    handleEmergency(io, socket);
  });

  return io;
};
