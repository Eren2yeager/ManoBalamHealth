import { formatInViewerTz } from "@/lib/timezone";
import { useUserStore } from "@/stores/userStore";
import type { ChatMessage } from "../types/chat.types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const currentUserId = useUserStore((state) => state.user?.id);
  const isOwnMessage = message.senderId === currentUserId;

  return (
    <div className={`mb-3 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-sm sm:max-w-[75%] ${
          isOwnMessage
            ? "rounded-br-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
            : "rounded-bl-lg border border-slate-200 bg-white text-slate-700"
        }`}
      >
        <p className="text-sm leading-6">{message.content}</p>
        <div
          className={`mt-1 text-right text-[11px] ${
            isOwnMessage ? "text-white/70" : "text-slate-400"
          }`}
        >
          {formatInViewerTz(message.sentAt, "h:mm a")}
        </div>
      </div>
    </div>
  );
}
