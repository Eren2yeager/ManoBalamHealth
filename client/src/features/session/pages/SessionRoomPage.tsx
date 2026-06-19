import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatPanel } from "../components/ChatPanel";
import { AudioCallRoom } from "../components/AudioCallRoom";
import { VideoCallRoom } from "../components/VideoCallRoom";
import { getSession } from "../api/session.api";
import { useSessionStore } from "../store/sessionStore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function SessionRoomPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const { session, isLoading, error, setSession, setIsLoading, setError, reset } =
    useSessionStore();

  useEffect(() => {
    if (!appointmentId) return;

    const loadSession = async () => {
      try {
        setIsLoading(true);
        const sessionData = await getSession(appointmentId);
        setSession(sessionData);
      } catch (err: any) {
        const msg = err.message || "Failed to load session";
        setError(msg);
        toast.error("Failed to load session");
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // Reset store state when leaving the session room
    return () => reset();
  }, [appointmentId, setSession, setIsLoading, setError, reset]);

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

  const mode = session?.mode ?? "video";

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 border-b border-border bg-card">
        <h1 className="text-2xl font-bold">Session Room</h1>
        <p className="text-muted-foreground text-sm capitalize">
          {mode ? `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}` : ""}
        </p>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1">
          {mode === "audio" ? (
            <AudioCallRoom
              sessionId={session?.sessionId ?? appointmentId ?? ""}
              iceServers={session?.iceServers}
              onEndCall={() => navigate(-1)}
            />
          ) : (
            <VideoCallRoom
              sessionId={session?.sessionId ?? appointmentId ?? ""}
              iceServers={session?.iceServers}
              onEndCall={() => navigate(-1)}
            />
          )}
        </div>
        <ChatPanel sessionId={session?.sessionId ?? appointmentId ?? ""} />
      </div>
    </div>
  );
}
