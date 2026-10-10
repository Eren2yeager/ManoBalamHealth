import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatPanel } from "../components/ChatPanel";
import { CallRoom } from "../components/CallRoom";
import { getSession } from "../api/session.api";
import { useSessionStore } from "../store/sessionStore";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CheckCircle2, LoaderCircle, NotebookPen } from "lucide-react";
import { SessionNotesPanel } from "../components/SessionNotes";
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
  const [notesOpen, setNotesOpen] = useState(false);
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
  const isPsychologist = user?.role === "psychologist";

  // One side panel at a time, Meet-style: opening one closes the other.
  const toggleChat = () => {
    setNotesOpen(false);
    setChatOpen((open) => !open);
  };
  const toggleNotes = () => {
    setChatOpen(false);
    setNotesOpen((open) => !open);
  };
  const panelOpen = chatOpen || notesOpen;
  const closePanels = () => {
    setChatOpen(false);
    setNotesOpen(false);
  };

  // Elapsed seconds right now, mirroring SessionTimer's math, so each note
  // is stamped with when in the session it was taken.
  const getAtSeconds = () => {
    const s = useSessionStore.getState().session;
    if (!s) return undefined;
    let total = s.durationSeconds ?? 0;
    if (s.status === "active" && s.activeTimingStartedAt) {
      total += Math.max(
        0,
        Math.floor((Date.now() - new Date(s.activeTimingStartedAt).getTime()) / 1000),
      );
    }
    if (typeof s.purchasedDurationSeconds === "number" && s.purchasedDurationSeconds > 0) {
      total = Math.min(total, s.purchasedDurationSeconds);
    }
    return total;
  };

  const notesPanel =
    isPsychologist && session ? (
      <SessionNotesPanel
        sessionId={session.sessionId}
        initialEntries={session.psychologistNotes ?? []}
        getAtSeconds={getAtSeconds}
        onEntriesChange={(entries) => patchSession({ psychologistNotes: entries })}
        onClose={closePanels}
      />
    ) : null;

  if (sessionEnded) {
    const usedMin = Math.floor((session?.durationSeconds ?? 0) / 60);
    const purchasedMin = Math.floor((session?.purchasedDurationSeconds ?? 0) / 60);
    return (
      <div className="flex h-dvh items-center justify-center bg-neutral-950 p-4">
        {notesPanel && (
          <Sheet open={notesOpen} onOpenChange={setNotesOpen}>
            <SheetContent
              side="right"
              className="dark flex w-full flex-col gap-0 border-border bg-card p-0 sm:max-w-md"
              showCloseButton={false}
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Session notes</SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-hidden">{notesPanel}</div>
            </SheetContent>
          </Sheet>
        )}
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
            <div className="mt-6 space-y-2">
              {isPsychologist && session && (
                <Button
                  onClick={() => setNotesOpen(true)}
                  className="w-full rounded-full"
                >
                  <NotebookPen className="size-4" />
                  Write session notes
                </Button>
              )}
              <Button
                variant={isPsychologist ? "ghost" : "outline"}
                onClick={() => navigate(-1)}
                className={`w-full rounded-full ${
                  isPsychologist
                    ? "text-white/70 hover:bg-white/10 hover:text-white"
                    : "border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                }`}
              >
                Back to appointments
              </Button>
            </div>
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
          onToggleChat={toggleChat}
          notesOpen={notesOpen}
          onToggleNotes={notesPanel ? toggleNotes : undefined}
          onLeave={() => navigate(-1)}
        />
      </div>

      {/* Desktop: collapsible side panel, Meet-style floating card */}
      {isDesktop && (
        <aside
          className={`hidden overflow-hidden transition-[width] duration-300 ease-in-out lg:block ${
            panelOpen ? "w-[344px]" : "w-0"
          }`}
        >
          <div className="dark h-full py-2 pr-2">
            <div className="h-full w-[336px] overflow-hidden rounded-xl border border-border">
              {notesOpen && notesPanel ? (
                notesPanel
              ) : (
                <ChatPanel
                  sessionId={sessionId}
                  disabled={chatDisabled}
                  onClose={closePanels}
                />
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Mobile: bottom sheet */}
      {!isDesktop && (
        <Sheet open={panelOpen} onOpenChange={(open) => !open && closePanels()}>
          <SheetContent
            side="bottom"
            className="dark flex h-[80dvh] flex-col gap-0 rounded-t-2xl border-border bg-card p-0"
            showCloseButton={false}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>{notesOpen ? "Session notes" : "In-session messages"}</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-hidden">
              {notesOpen && notesPanel ? (
                notesPanel
              ) : (
                <ChatPanel
                  sessionId={sessionId}
                  disabled={chatDisabled}
                  onClose={closePanels}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
