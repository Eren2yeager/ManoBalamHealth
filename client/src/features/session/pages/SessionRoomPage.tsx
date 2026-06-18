import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChatPanel } from "../components/ChatPanel";
import { getSession } from "../api/session.api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function SessionRoomPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId) return;

    const loadSession = async () => {
      try {
        setIsLoading(true);
        const sessionData = await getSession(appointmentId);
        setSession(sessionData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load session");
        toast.error("Failed to load session");
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [appointmentId]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-6 border-b">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1 flex">
          <Skeleton className="flex-1" />
          <Skeleton className="w-1/3" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 border-b border-border bg-card">
        <h1 className="text-2xl font-bold">Session Room</h1>
        <p className="text-muted-foreground text-sm">
          {session?.mode ? `Mode: ${session.mode}` : ""}
        </p>
      </div>
      <div className="flex-1 flex">
        <div className="flex-1 bg-muted/30 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold mb-2">Video/Audio Call</h2>
            <p className="text-muted-foreground">Coming soon</p>
          </div>
        </div>
        <ChatPanel sessionId={session?.sessionId || appointmentId} />
      </div>
    </div>
  );
}
