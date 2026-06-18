import { useState, useEffect, useCallback, useRef } from "react";
import { getSocket, connectSocket } from "@/lib/socket";
import { getChatHistory } from "../api/chat.api";
import type { ChatMessage } from "../types/chat.types";

export interface UseChatMessagesOptions {
  sessionId: string;
  initialLimit?: number;
}

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

  // Fetch chat history
  const fetchHistory = useCallback(async (page = 1, limit = initialLimit) => {
    try {
      setIsLoading(true);
      const result = await getChatHistory(sessionId, { page, limit });
      
      if (page === 1) {
        setMessages(result.items);
      } else {
        setMessages((prev) => [...result.items, ...prev]);
      }
      
      setHasMore(result.meta.page < result.meta.totalPages);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, initialLimit]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    const socket = getSocket();
    
    try {
      socket.emit("chat:send", { sessionId, content });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  }, [sessionId, isSending]);

  // Initialize socket connection and listeners
  useEffect(() => {
    const socket = connectSocket();

    const handleMessageReceived = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    // Listen for new messages
    socket.on("chat:message", handleMessageReceived);
    socket.emit("chat:join", sessionId);

    // Fetch initial history
    fetchHistory(1);

    return () => {
      socket.off("chat:message", handleMessageReceived);
      socket.emit("chat:leave", sessionId);
    };
  }, [sessionId, fetchHistory]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return {
    messages,
    isLoading,
    hasMore,
    isSending,
    sendMessage,
    fetchHistory,
    messagesEndRef,
  };
}
