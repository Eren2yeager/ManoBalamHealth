import { Types } from "mongoose";
import { MessageModel } from "./message.model";
import { SessionModel } from "@/modules/session/session.model";
import { AppointmentModel } from "@/modules/appointment/appointment.model";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";
import { UserModel } from "@/modules/user/user.model";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { ChatMessageResponse } from "./chat.types";

class ChatService {
  /**
   * Get chat history for a session
   */
  async getChatHistory(
    sessionId: string,
    userId: string,
    userRole: string,
    query: { page: number; limit: number }
  ): Promise<{
    data: ChatMessageResponse[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    // Get session and check authorization
    const session = await SessionModel.findById(sessionId).populate("appointmentId");
    if (!session) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Session not found");
    }

    // Get appointment
    const appointment = await AppointmentModel.findById((session.appointmentId as any)._id)
      .populate("patientId")
      .populate("psychologistId");

    if (!appointment) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Appointment not found");
    }

    await (appointment as any).populate("psychologistId.userId");

    // Check if user is authorized
    const apptAny = appointment as any;
    const isAuthorized =
      userRole === "admin" ||
      apptAny.patientId._id.toString() === userId ||
      apptAny.psychologistId.userId._id.toString() === userId;

    if (!isAuthorized) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        ErrorCodes.FORBIDDEN_ROLE,
        "You are not authorized to view this chat history"
      );
    }

    // Get messages with pagination
    const skip = (query.page - 1) * query.limit;
    const [messages, total] = await Promise.all([
      MessageModel.find({ sessionId: session._id })
        .sort({ sentAt: -1 }) // newest first
        .skip(skip)
        .limit(query.limit),
      MessageModel.countDocuments({ sessionId: session._id }),
    ]);

    // Reverse to get oldest first for display
    const reversedMessages = messages.reverse();

    const totalPages = Math.ceil(total / query.limit);

    const data: ChatMessageResponse[] = reversedMessages.map((msg) => ({
      id: msg._id.toString(),
      senderId: msg.senderId.toString(),
      content: msg.content,
      attachmentUrl: msg.attachmentUrl,
      sentAt: msg.sentAt.toISOString(),
      readAt: msg.readAt?.toISOString(),
    }));

    return { data, meta: { page: query.page, limit: query.limit, total, totalPages } };
  }
}

export const chatService = new ChatService();
