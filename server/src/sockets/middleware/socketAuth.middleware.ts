import { Socket } from "socket.io";
import { verifyAccessToken } from "@/middlewares/auth.middleware";
import { ExtendedError } from "socket.io/dist/namespace";

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    role: string;
  };
}

export const socketAuthMiddleware = async (
  socket: AuthenticatedSocket,
  next: (err?: ExtendedError) => void
) => {
  try {
    // Get token from handshake
    const token = socket.handshake.auth?.token;
    if (!token) {
      throw new Error("Authentication token required");
    }

    // Verify token
    const payload = await verifyAccessToken(token);
    if (!payload) {
      throw new Error("Invalid or expired token");
    }

    // Attach user to socket
    socket.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(new Error("Authentication failed"));
  }
};
