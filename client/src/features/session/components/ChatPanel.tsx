import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle, MessageSquareText, Send } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { useChatMessages } from "../hooks/useChatMessages";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ChatPanelProps {
  sessionId: string;
}

export function ChatPanel({ sessionId }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const {
    messages,
    isLoading,
    sendMessage,
    isSending,
    messagesEndRef,
  } = useChatMessages({ sessionId });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    
    await sendMessage(inputValue);
    setInputValue("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black tracking-tight text-slate-950">Session Chat</h3>
            <p className="mt-1 text-xs text-slate-500">
              Share updates and notes securely during the call.
            </p>
          </div>
          <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600">
            Live
          </Badge>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#fcfbff_40%,#f8f7ff_100%)] p-4 sm:p-5">
        {isLoading && messages.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <Skeleton className="h-16 w-2/3 rounded-3xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="grid size-16 place-items-center rounded-3xl bg-violet-100 text-violet-700">
              <MessageSquareText className="size-8" />
            </div>
            <p className="mt-4 text-base font-black text-slate-900">No messages yet</p>
            <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">
              Start the conversation here while you stay on the session.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 bg-white p-4">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <Input
            ref={inputRef}
            placeholder="Type a secure message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSending}
            className="h-12 flex-1 rounded-2xl border-slate-200 bg-slate-50 px-4"
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isSending}
            size="icon-lg"
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700"
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
