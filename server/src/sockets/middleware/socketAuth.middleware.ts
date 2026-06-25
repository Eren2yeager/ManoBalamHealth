import { Socket } from "socket.io";
import { verifyAccessToken } from "@/middlewares/auth.middleware";
import { ExtendedError } from "socket.io/dist/namespace";
import { UserModel } from "@/modules/user/user.model";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";

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
    const user = await UserModel.findById(payload.userId).select("role isActive isVerified authVersion");
    if (
      !user ||
      !user.isActive ||
      !user.isVerified ||
      user.role !== payload.role ||
      (user.authVersion ?? 0) !== payload.authVersion
    ) {
      throw new Error("Account is not active");
    }
    if (user.role === "psychologist") {
      const psychologist = await PsychologistModel.findOne({ userId: user._id }).select(
        "verificationStatus onboardingStatus",
      );
      if (
        !psychologist ||
        psychologist.verificationStatus !== "approved" ||
        psychologist.onboardingStatus !== "approved"
      ) {
        throw new Error("Psychologist approval required");
      }
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
