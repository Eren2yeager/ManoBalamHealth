import { useState, useEffect, useCallback, useRef } from "react";
import { connectSocket } from "@/lib/socket";
import { getChatHistory } from "../api/chat.api";
import type { ChatMessage } from "../types/chat.types";

export interface UseChatMessagesOptions {
  sessionId: string;
  initialLimit?: number;
}

const TYPING_THROTTLE_MS = 2000;
const TYPING_INDICATOR_TIMEOUT_MS = 3000;

/**
 * Socket event contracts (FRONTEND_PLAN.md § 6.2):
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
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTypingEmitRef = useRef(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    async (content: string, attachmentUrl?: string) => {
      const trimmed = content.trim();
      if ((!trimmed && !attachmentUrl) || isSending) return;
      setIsSending(true);
      try {
        const socket = connectSocket();
        socket.emit("chat:message", { sessionId, content: trimmed, attachmentUrl });
      } finally {
        setIsSending(false);
      }
    },
    [sessionId, isSending]
  );

  // Throttled so keystrokes don't flood the socket.
  const sendTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingEmitRef.current < TYPING_THROTTLE_MS) return;
    lastTypingEmitRef.current = now;
    connectSocket().emit("chat:typing", { sessionId });
  }, [sessionId]);

  useEffect(() => {
    const socket = connectSocket();

    const joinRoom = () => {
      socket.emit("chat:join", { sessionId });
    };

    // Join now AND on every reconnect — room membership is lost when the
    // socket drops, and messages silently stop arriving otherwise.
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);

    const handleMessage = (payload: { message: ChatMessage }) => {
      setMessages((prev) =>
        prev.some((m) => m.id === payload.message.id) ? prev : [...prev, payload.message]
      );
      setIsPeerTyping(false);
    };

    const handleTyping = () => {
      setIsPeerTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(
        () => setIsPeerTyping(false),
        TYPING_INDICATOR_TIMEOUT_MS
      );
    };

    socket.on("chat:message", handleMessage);
    socket.on("chat:typing", handleTyping);

    fetchHistory(1);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("chat:message", handleMessage);
      socket.off("chat:typing", handleTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [sessionId, fetchHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPeerTyping, scrollToBottom]);

  return {
    messages,
    isLoading,
    hasMore,
    isSending,
    isPeerTyping,
    sendMessage,
    sendTyping,
    fetchHistory,
    messagesEndRef,
  };
}
