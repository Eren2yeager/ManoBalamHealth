import { Server, Socket } from "socket.io";
import { isValidObjectId } from "mongoose";
import { MessageModel } from "@/modules/chat/message.model";
import { sessionLifecycleService } from "@/modules/session/sessionLifecycle.service";
import {
  extractSessionId,
  isSessionParticipant,
  safeHandler,
} from "@/sockets/utils/sessionAuth";

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    role: string;
  };
}

const MAX_MESSAGE_LENGTH = 2000;
const MAX_ATTACHMENT_URL_LENGTH = 1024;

// Simple sliding-window rate limit per socket: 20 messages / 10 seconds.
const RATE_LIMIT_WINDOW_MS = 10_000;
const RATE_LIMIT_MAX = 20;

const isSafeAttachmentUrl = (url: string): boolean => {
  if (url.length > MAX_ATTACHMENT_URL_LENGTH) return false;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
};

const roomOf = (sessionId: string) => `session:${sessionId}`;

export const handleChat = (io: Server, socket: AuthenticatedSocket) => {
  if (!socket.user) return;

  const userId = socket.user.userId;
  const sendTimestamps: number[] = [];

  const isRateLimited = (): boolean => {
    const now = Date.now();
    while (sendTimestamps.length && now - sendTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
      sendTimestamps.shift();
    }
    if (sendTimestamps.length >= RATE_LIMIT_MAX) return true;
    sendTimestamps.push(now);
    return false;
  };

  const handleJoinRoom = safeHandler("chat:join", async (payload: unknown) => {
    const sessionId = extractSessionId(payload);
    if (!sessionId) return;
    if (!(await isSessionParticipant(sessionId, userId))) return;
    await socket.join(roomOf(sessionId));
  });

  const handleSendMessage = safeHandler("chat:message", async (data: unknown) => {
    if (!data || typeof data !== "object") return;
    const { sessionId, content, attachmentUrl } = data as {
      sessionId?: unknown;
      content?: unknown;
      attachmentUrl?: unknown;
    };

    if (typeof sessionId !== "string") return;
    const trimmed = typeof content === "string" ? content.trim() : "";
    if (trimmed.length > MAX_MESSAGE_LENGTH) return;

    let safeAttachmentUrl: string | undefined;
    if (attachmentUrl !== undefined && attachmentUrl !== null && attachmentUrl !== "") {
      if (typeof attachmentUrl !== "string" || !isSafeAttachmentUrl(attachmentUrl)) return;
      safeAttachmentUrl = attachmentUrl;
    }

    // A message must carry text, an attachment, or both.
    if (!trimmed && !safeAttachmentUrl) return;

    if (isRateLimited()) return;
    if (!(await isSessionParticipant(sessionId, userId))) return;
    if (!(await sessionLifecycleService.canUseLiveSessionFeatures(sessionId))) return;

    const message = await MessageModel.create({
      sessionId,
      senderId: userId,
      content: trimmed,
      attachmentUrl: safeAttachmentUrl,
    });

    io.to(roomOf(sessionId)).emit("chat:message", {
      message: {
        id: message._id.toString(),
        senderId: userId,
        content: trimmed,
        attachmentUrl: safeAttachmentUrl,
        sentAt: message.sentAt.toISOString(),
      },
    });
  });

  const handleTyping = safeHandler("chat:typing", async (data: unknown) => {
    const sessionId = extractSessionId(data);
    if (!sessionId) return;
    // Room membership implies the participant check already passed on join.
    if (!socket.rooms.has(roomOf(sessionId))) return;
    socket.to(roomOf(sessionId)).emit("chat:typing", { userId });
  });

  const handleMessageRead = safeHandler("chat:message-read", async (data: unknown) => {
    if (!data || typeof data !== "object") return;
    const { messageId } = data as { messageId?: unknown };
    if (typeof messageId !== "string" || !isValidObjectId(messageId)) return;

    const message = await MessageModel.findById(messageId);
    if (!message || message.readAt) return;

    // Only the recipient (a session participant who is not the sender) may
    // mark a message as read.
    if (message.senderId.toString() === userId) return;
    const sessionId = message.sessionId.toString();
    if (!(await isSessionParticipant(sessionId, userId))) return;

    message.readAt = new Date();
    await message.save();

    io.to(roomOf(sessionId)).emit("chat:read", {
      messageId,
      readAt: message.readAt.toISOString(),
    });
  });

  socket.on("chat:join", handleJoinRoom);
  socket.on("chat:join-room", handleJoinRoom);
  socket.on("chat:message", handleSendMessage);
  socket.on("chat:send-message", handleSendMessage);
  socket.on("chat:typing", handleTyping);
  socket.on("chat:message-read", handleMessageRead);
};
