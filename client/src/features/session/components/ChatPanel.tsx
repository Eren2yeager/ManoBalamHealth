import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle, MessageSquareText, Paperclip, Send, WifiOff, X } from "lucide-react";
import { toast } from "sonner";
import { MessageBubble } from "./MessageBubble";
import { useChatMessages } from "../hooks/useChatMessages";
import { uploadChatAttachment } from "../api/chat.api";
import { Skeleton } from "@/components/ui/skeleton";

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const ACCEPTED_ATTACHMENT_TYPES = "image/jpeg,image/png,image/webp,image/gif,application/pdf";

interface ChatPanelProps {
  sessionId: string;
  /** Chat only works while both participants are in the session. */
  disabled?: boolean;
  onClose?: () => void;
}

export function ChatPanel({ sessionId, disabled = false, onClose }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const {
    messages,
    isLoading,
    sendMessage,
    isSending,
    isPeerTyping,
    sendTyping,
    messagesEndRef,
  } = useChatMessages({ sessionId });
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || disabled) return;

    await sendMessage(inputValue);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file || disabled || isUploading) return;
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error("Attachments can be up to 8 MB");
      return;
    }

    setIsUploading(true);
    try {
      const { url } = await uploadChatAttachment(sessionId, file);
      // Any text already typed goes out as the caption.
      await sendMessage(inputValue, url);
      setInputValue("");
    } catch {
      toast.error("Failed to send the attachment");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-card text-card-foreground">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">In-session messages</h3>
        {onClose && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            onClick={onClose}
            aria-label="Close chat"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && messages.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <Skeleton className="h-14 w-2/3 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <MessageSquareText className="size-5" />
            </div>
            <p className="mt-3 text-sm font-medium">No messages yet</p>
            <p className="mt-1 max-w-52 text-xs leading-5 text-muted-foreground">
              Messages sent here stay within this session.
            </p>
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}
        {isPeerTyping && !disabled && (
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex gap-1">
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
            </span>
            typing
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border p-3">
        {disabled && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            <WifiOff className="size-3.5 shrink-0" />
            Chat is available when you're both in the session.
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_ATTACHMENT_TYPES}
            className="hidden"
            onChange={handleFilePicked}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 rounded-full text-muted-foreground"
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach a file"
          >
            {isUploading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Paperclip className="size-4" />
            )}
          </Button>
          <Input
            ref={inputRef}
            placeholder={disabled ? "Chat unavailable" : "Send a message"}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (e.target.value.trim() && !disabled) sendTyping();
            }}
            maxLength={2000}
            disabled={disabled}
            className="h-10 flex-1 rounded-full bg-muted px-4"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isSending || disabled}
            size="icon"
            className="size-10 shrink-0 rounded-full"
            aria-label="Send message"
          >
            {isSending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
