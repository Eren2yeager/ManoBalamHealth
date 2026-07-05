import { FileText } from "lucide-react";
import { formatInViewerTz } from "@/lib/timezone";
import { useUserStore } from "@/stores/userStore";
import type { ChatMessage } from "../types/chat.types";

interface MessageBubbleProps {
  message: ChatMessage;
}

const isImageUrl = (url: string) =>
  /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url) || url.includes("/image/upload/");

export function MessageBubble({ message }: MessageBubbleProps) {
  const currentUserId = useUserStore((state) => state.user?.id);
  const isOwnMessage = message.senderId === currentUserId;

  return (
    <div className={`mb-2 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 sm:max-w-[75%] ${
          isOwnMessage
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted text-foreground"
        }`}
      >
        {message.attachmentUrl &&
          (isImageUrl(message.attachmentUrl) ? (
            <a
              href={message.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-1 block overflow-hidden rounded-xl"
            >
              <img
                src={message.attachmentUrl}
                alt="Attachment"
                loading="lazy"
                className="max-h-60 w-full object-cover"
              />
            </a>
          ) : (
            <a
              href={message.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mb-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm underline-offset-2 hover:underline ${
                isOwnMessage ? "bg-primary-foreground/10" : "bg-background/60"
              }`}
            >
              <FileText className="size-4 shrink-0" />
              View document
            </a>
          ))}
        {message.content && (
          <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
        )}
        <div
          className={`mt-0.5 text-right text-[10px] ${
            isOwnMessage ? "text-primary-foreground/60" : "text-muted-foreground"
          }`}
        >
          {formatInViewerTz(message.sentAt, "h:mm a")}
        </div>
      </div>
    </div>
  );
}
