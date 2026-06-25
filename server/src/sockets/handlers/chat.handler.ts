import { Server, Socket } from "socket.io";
import { MessageModel } from "@/modules/chat/message.model";
import { SessionModel } from "@/modules/session/session.model";
import { AppointmentModel } from "@/modules/appointment/appointment.model";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";
import { sessionLifecycleService } from "@/modules/session/sessionLifecycle.service";

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    role: string;
  };
}

const isUserParticipant = async (userId: string, appointmentId: any): Promise<boolean> => {
  const appointment = await AppointmentModel.findById(appointmentId)
    .populate("psychologistId");
  if (!appointment) return false;

  const apptAny = appointment as any;

  // Check patient
  if (apptAny.patientId.toString() === userId) return true;

  // Check psychologist
  const psychologist = await PsychologistModel.findById(apptAny.psychologistId);
  if (psychologist && psychologist.userId.toString() === userId) return true;

  return false;
};

export const handleChat = (io: Server, socket: AuthenticatedSocket) => {
  if (!socket.user) return;

  const userId = socket.user.userId;

  // Join a chat room (session room)
  const handleJoinRoom = async (payload: string | { sessionId: string }) => {
    const sessionId =
      typeof payload === "string" ? payload : payload?.sessionId;
    if (!sessionId) return;

    // Verify that user has access to this session
    const session = await SessionModel.findById(sessionId).populate("appointmentId");
    if (!session) return;

    // Get appointment
    const appointment = session.appointmentId;
    if (!appointment) return;

    // Check if user is a participant
    const isParticipant = await isUserParticipant(userId, appointment._id);
    if (!isParticipant) return;

    // Join the room
    socket.join(`session:${sessionId}`);
  };

  // Handle sending a chat message
  const handleSendMessage = async (data: {
    sessionId: string;
    content: string;
    attachmentUrl?: string;
  }) => {
    const { sessionId, content, attachmentUrl } = data;

    // Verify session
    const session = await SessionModel.findById(sessionId).populate("appointmentId");
    if (!session) return;
    if (session.status === "ended") return;

    const appointment = session.appointmentId;
    if (!appointment) return;

    // Check user is participant
    const isParticipant = await isUserParticipant(userId, appointment._id);
    if (!isParticipant) return;
    if (!(await sessionLifecycleService.canUseLiveSessionFeatures(sessionId))) return;

    // Create message
    const message = await MessageModel.create({
      sessionId: session._id,
      senderId: userId,
      content,
      attachmentUrl,
    });

    // Emit to room
    io.to(`session:${sessionId}`).emit("chat:message", {
      message: {
        id: message._id.toString(),
        senderId: userId,
        content,
        attachmentUrl,
        sentAt: message.sentAt.toISOString(),
      },
    });
  };

  const handleTyping = async (data: { sessionId: string }) => {
    const { sessionId } = data;
    const session = await SessionModel.findById(sessionId).populate("appointmentId");
    if (!session) return;
    if (session.status === "ended") return;

    const appointment = session.appointmentId;
    if (!appointment) return;

    const isParticipant = await isUserParticipant(userId, (appointment as any)._id);
    if (!isParticipant) return;
    if (!(await sessionLifecycleService.canUseLiveSessionFeatures(sessionId))) return;

    socket.to(`session:${sessionId}`).emit("chat:typing", { userId });
  };

  // Handle mark message as read
  const handleMessageRead = async (data: { messageId: string }) => {
    const { messageId } = data;
    await MessageModel.findByIdAndUpdate(messageId, {
      readAt: new Date(),
    });

    // Emit read event to room
    const message = await MessageModel.findById(messageId);
    if (message) {
      io.to(`session:${message.sessionId}`).emit("chat:read", {
        messageId,
        readAt: new Date().toISOString(),
      });
    }
  };

  // Register event listeners
  socket.on("chat:join", handleJoinRoom);
  socket.on("chat:join-room", handleJoinRoom);
  socket.on("chat:message", handleSendMessage);
  socket.on("chat:send-message", handleSendMessage);
  socket.on("chat:typing", handleTyping);
  socket.on("chat:message-read", handleMessageRead);
};
