import { useState, useEffect, useCallback, useRef } from "react";
import { connectSocket } from "@/lib/socket";
import { getChatHistory } from "../api/chat.api";
import type { ChatMessage } from "../types/chat.types";

export interface UseChatMessagesOptions {
  sessionId: string;
  initialLimit?: number;
}

/**
 * Matches socket event contracts from FRONTEND_PLAN.md § 6.2 exactly.
 *
 * emit   "chat:join"    { sessionId }
 * emit   "chat:message" { sessionId, content, attachmentUrl? }
 * emit   "chat:typing"  { sessionId }
 * listen "chat:message" { message: ChatMessage }
 * listen "chat:typing"  { userId: string }
 */
export function useChatMessages({
  sessionId,
  initialLimit = 50,
}: UseChatMessagesOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchHistory = useCallback(
    async (page = 1, limit = initialLimit) => {
      try {
        setIsLoading(true);
        const result = await getChatHistory(sessionId, { page, limit });
        if (page === 1) {
          setMessages(result.items);
        } else {
          // Prepend older messages
          setMessages((prev) => [...result.items, ...prev]);
        }
        setHasMore(result.meta.page < result.meta.totalPages);
      } catch {
        // Non-fatal — history simply won't be pre-populated
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, initialLimit]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isSending) return;
      setIsSending(true);
      try {
        const socket = connectSocket();
        // Plan § 6.2: emit "chat:message" with { sessionId, content }
        socket.emit("chat:message", { sessionId, content });
      } finally {
        setIsSending(false);
      }
    },
    [sessionId, isSending]
  );

  const sendTyping = useCallback(() => {
    const socket = connectSocket();
    // Plan § 6.2: emit "chat:typing" with { sessionId }
    socket.emit("chat:typing", { sessionId });
  }, [sessionId]);

  useEffect(() => {
    const socket = connectSocket();

    // Plan § 6.2: join with object payload { sessionId }
    socket.emit("chat:join", { sessionId });

    // Plan § 6.2: incoming payload is { message: ChatMessage }
    const handleMessage = (payload: { message: ChatMessage }) => {
      setMessages((prev) => [...prev, payload.message]);
    };

    socket.on("chat:message", handleMessage);

    fetchHistory(1);

    return () => {
      socket.off("chat:message", handleMessage);
      // No explicit leave event defined in the plan
    };
  }, [sessionId, fetchHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return {
    messages,
    isLoading,
    hasMore,
    isSending,
    sendMessage,
    sendTyping,
    fetchHistory,
    messagesEndRef,
  };
}
