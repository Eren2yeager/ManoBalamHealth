import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatPanel } from "../components/ChatPanel";
import { CallRoom } from "../components/CallRoom";
import { getSession } from "../api/session.api";
import { useSessionStore } from "../store/sessionStore";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { connectSocket } from "@/lib/socket";
import { useUserStore } from "@/stores/userStore";

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 1024px)").matches,
  );
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
};

export function SessionRoomPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const [sessionPresence, setSessionPresence] = useState<{
    patientOnline: boolean;
    psychologistOnline: boolean;
  }>({
    patientOnline: false,
    psychologistOnline: false,
  });
  const user = useUserStore((state) => state.user);

  const { session, isLoading, error, setSession, patchSession, setIsLoading, setError, reset } =
    useSessionStore();

  useEffect(() => {
    if (!appointmentId) return;

    const loadSession = async () => {
      try {
        setIsLoading(true);
        const sessionData = await getSession(appointmentId);
        setSession(sessionData);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load session";
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

  useEffect(() => {
    if (!session) return;
    setSessionPresence({
      patientOnline: session.participants.patientOnline,
      psychologistOnline: session.participants.psychologistOnline,
    });
  }, [session]);

  useEffect(() => {
    if (!session?.sessionId) return;

    const socket = connectSocket();
    const joinPresence = () => {
      socket.emit("session:presence:join", { sessionId: session.sessionId });
    };

    const handlePresenceUpdate = (payload: {
      sessionId: string;
      patientOnline: boolean;
      psychologistOnline: boolean;
    }) => {
      if (payload.sessionId !== session.sessionId) return;
      setSessionPresence({
        patientOnline: payload.patientOnline,
        psychologistOnline: payload.psychologistOnline,
      });
    };

    const handleLifecycleUpdate = (payload: {
      sessionId: string;
      status: "not_started" | "active" | "ended";
      startedAt?: string;
      activeTimingStartedAt?: string;
      endedAt?: string;
      durationSeconds: number;
      purchasedDurationSeconds: number;
      remainingSeconds: number;
    }) => {
      if (payload.sessionId !== session.sessionId) return;

      patchSession({
        status: payload.status,
        startedAt: payload.startedAt,
        activeTimingStartedAt: payload.activeTimingStartedAt,
        endedAt: payload.endedAt,
        durationSeconds: payload.durationSeconds,
        purchasedDurationSeconds: payload.purchasedDurationSeconds,
        remainingSeconds: payload.remainingSeconds,
      });
    };

    const handleSessionEnded = (payload: { sessionId: string; endedAt?: string }) => {
      if (payload.sessionId !== session.sessionId) return;

      patchSession({
        status: "ended",
        endedAt: payload.endedAt,
        activeTimingStartedAt: undefined,
        remainingSeconds: 0,
      });
      toast.info("This session has ended");
    };

    if (socket.connected) {
      joinPresence();
    }
    socket.on("connect", joinPresence);
    socket.on("session:presence:update", handlePresenceUpdate);
    socket.on("session:lifecycle:update", handleLifecycleUpdate);
    socket.on("session:ended", handleSessionEnded);

    return () => {
      socket.emit("session:presence:leave", { sessionId: session.sessionId });
      socket.off("connect", joinPresence);
      socket.off("session:presence:update", handlePresenceUpdate);
      socket.off("session:lifecycle:update", handleLifecycleUpdate);
      socket.off("session:ended", handleSessionEnded);
    };
  }, [patchSession, session?.sessionId]);

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-white/60">
          <LoaderCircle className="size-8 animate-spin" />
          <p className="text-sm">Preparing your session</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-dvh items-center justify-center bg-neutral-950 p-4">
        <div className="w-full max-w-sm text-center text-white">
          <h2 className="text-lg font-semibold">Session unavailable</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">{error}</p>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mt-6 border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const mode = session?.mode === "audio" ? "audio" : "video";
  const patientOnline = sessionPresence.patientOnline;
  const psychologistOnline = sessionPresence.psychologistOnline;
  const sessionEnded = session?.status === "ended";
  const counterpartRole = user?.role === "psychologist" ? "patient" : "psychologist";
  const counterpartOnline =
    counterpartRole === "patient" ? patientOnline : psychologistOnline;
  const chatDisabled = !(patientOnline && psychologistOnline) || sessionEnded;
  const sessionId = session?.sessionId ?? appointmentId ?? "";

  if (sessionEnded) {
    const usedMin = Math.floor((session?.durationSeconds ?? 0) / 60);
    const purchasedMin = Math.floor((session?.purchasedDurationSeconds ?? 0) / 60);
    return (
      <div className="flex h-dvh items-center justify-center bg-neutral-950 p-4">
        <div className="w-full max-w-sm text-center text-white">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/15">
            <CheckCircle2 className="size-7 text-success" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Session completed</h2>
          <p className="mt-2 text-sm text-white/60">
            {usedMin} of {purchasedMin} purchased minutes used.
          </p>
          {user?.role === "patient" && appointmentId ? (
            <div className="mt-6 space-y-2">
              <Button
                onClick={() => navigate(`/feedback/${appointmentId}`)}
                className="w-full rounded-full"
              >
                Share feedback
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="w-full rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              >
                Back to appointments
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="mt-6 rounded-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              Back to appointments
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh bg-neutral-950">
      <div className="min-w-0 flex-1">
        <CallRoom
          sessionId={sessionId}
          mode={mode}
          iceServers={session?.iceServers}
          elapsedSeconds={session?.durationSeconds}
          activeTimingStartedAt={session?.activeTimingStartedAt}
          purchasedDurationSeconds={session?.purchasedDurationSeconds}
          counterpartLabel={counterpartRole === "patient" ? "Patient" : "Psychologist"}
          counterpartOnline={counterpartOnline}
          chatOpen={chatOpen}
          onToggleChat={() => setChatOpen((open) => !open)}
          onLeave={() => navigate(-1)}
        />
      </div>

      {/* Desktop: collapsible side panel, Meet-style floating card */}
      {isDesktop && (
        <aside
          className={`hidden overflow-hidden transition-[width] duration-300 ease-in-out lg:block ${
            chatOpen ? "w-[344px]" : "w-0"
          }`}
        >
          <div className="dark h-full py-2 pr-2">
            <div className="h-full w-[336px] overflow-hidden rounded-xl border border-border">
              <ChatPanel
                sessionId={sessionId}
                disabled={chatDisabled}
                onClose={() => setChatOpen(false)}
              />
            </div>
          </div>
        </aside>
      )}

      {/* Mobile: bottom sheet */}
      {!isDesktop && (
        <Sheet open={chatOpen} onOpenChange={setChatOpen}>
          <SheetContent
            side="bottom"
            className="dark flex h-[80dvh] flex-col gap-0 rounded-t-2xl border-border bg-card p-0"
            showCloseButton={false}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>In-session messages</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-hidden">
              <ChatPanel
                sessionId={sessionId}
                disabled={chatDisabled}
                onClose={() => setChatOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
