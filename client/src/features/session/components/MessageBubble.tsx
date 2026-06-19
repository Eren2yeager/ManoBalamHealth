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
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isOwnMessage
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-muted-foreground rounded-bl-md"
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <div className="text-xs opacity-70 mt-1 text-right">
          {formatInViewerTz(message.sentAt, "h:mm a")}
        </div>
      </div>
    </div>
  );
}
