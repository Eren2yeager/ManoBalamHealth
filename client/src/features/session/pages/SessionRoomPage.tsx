import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatPanel } from "../components/ChatPanel";
import { AudioCallRoom } from "../components/AudioCallRoom";
import { VideoCallRoom } from "../components/VideoCallRoom";
import { getSession } from "../api/session.api";
import { useSessionStore } from "../store/sessionStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ArrowLeft,
  LoaderCircle,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { connectSocket } from "@/lib/socket";
import { useUserStore } from "@/stores/userStore";

export function SessionRoomPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
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

    const handleSessionEnded = (payload: {
      sessionId: string;
      endedAt?: string;
    }) => {
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
      <div className="flex h-screen flex-col bg-[radial-gradient(circle_at_top,#2b234f_0%,#151127_50%,#0b0b13_100%)]">
        <div className="border-b border-white/10 px-4 py-4 sm:px-6">
          <Skeleton className="mb-2 h-8 w-56 rounded-xl bg-white/10" />
          <Skeleton className="h-4 w-40 rounded-xl bg-white/10" />
        </div>
        <div className="flex flex-1 gap-4 p-4 sm:p-6">
          <Skeleton className="flex-1 rounded-[2rem] bg-white/10" />
          <Skeleton className="hidden w-[360px] rounded-[2rem] bg-white/10 xl:block" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#2b234f_0%,#151127_55%,#0b0b16_100%)] p-6">
        <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/8 p-8 text-center text-white shadow-2xl backdrop-blur">
          <h2 className="text-2xl font-black">Session unavailable</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">{error}</p>
          <Button
            onClick={() => navigate(-1)}
            className="mt-6 rounded-xl bg-white text-slate-950 hover:bg-slate-100"
          >
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const mode = session?.mode ?? "video";
  const modeLabel = mode.charAt(0).toUpperCase() + mode.slice(1);
  const modeIcon = mode === "audio" ? <Phone className="size-4" /> : <Video className="size-4" />;
  const roomIdLabel = session?.roomId ? session.roomId.slice(-8).toUpperCase() : "SESSION";
  const patientOnline = sessionPresence.patientOnline;
  const psychologistOnline = sessionPresence.psychologistOnline;
  const sessionEnded = session?.status === "ended";
  const bothParticipantsOnline =
    Boolean(session) && patientOnline && psychologistOnline && !sessionEnded;
  const counterpartRole = user?.role === "psychologist" ? "patient" : "psychologist";

  return (
    <div className="flex h-screen flex-col bg-[#07070c] text-white">
      <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(19,18,33,.95)_0%,rgba(12,12,20,.88)_100%)] px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-xl text-white hover:bg-white/10 hover:text-white"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-black tracking-tight sm:text-xl">
                  Session Room
                </h1>
                <Badge className="rounded-full bg-white/10 px-2.5 py-1 text-white">
                  {modeIcon}
                  {modeLabel}
                </Badge>
                <Badge className="hidden rounded-full bg-emerald-500/20 px-2.5 py-1 text-emerald-100 sm:inline-flex">
                  <ShieldCheck className="mr-1 size-3.5" />
                  Protected
                </Badge>
              </div>
              <p className="mt-1 text-xs text-white/60 sm:text-sm">
                Room {roomIdLabel} · secure realtime care space
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="hidden rounded-full bg-white/10 px-3 py-1 text-white xl:inline-flex">
              <Sparkles className="mr-1 size-3.5 text-amber-300" />
              Live session
            </Badge>
            <Button
              variant="outline"
              className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white xl:hidden"
              onClick={() => setChatOpen(true)}
            >
              <MessageSquareText className="mr-2 size-4" />
              Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {sessionEnded ? (
          <div className="mx-auto flex h-full max-w-4xl items-center justify-center p-6">
            <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/8 p-8 text-center text-white shadow-2xl backdrop-blur">
              <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-emerald-500/15">
                <ShieldCheck className="size-7 text-emerald-200" />
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-tight">Session completed</h2>
              <p className="mt-3 text-sm leading-7 text-white/70">
                The session time has been fully used and the meeting is now closed.
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-left text-sm">
                <div className="flex items-center justify-between py-1">
                  <span className="text-white/70">Used time</span>
                  <span className="font-medium text-white">
                    {Math.floor((session?.durationSeconds ?? 0) / 60)} min
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-white/70">Purchased time</span>
                  <span className="font-medium text-white">
                    {Math.floor((session?.purchasedDurationSeconds ?? 0) / 60)} min
                  </span>
                </div>
              </div>
              {user?.role === "patient" && appointmentId ? (
                <Button
                  onClick={() => navigate(`/feedback/${appointmentId}`)}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700"
                >
                  Leave Feedback
                </Button>
              ) : (
                <Button
                  onClick={() => navigate(-1)}
                  className="mt-6 rounded-xl bg-white text-slate-950 hover:bg-slate-100"
                >
                  Back to appointments
                </Button>
              )}
            </div>
          </div>
        ) : bothParticipantsOnline ? (
          <div className="mx-auto flex h-full max-w-[1700px] gap-4 p-4 sm:gap-5 sm:p-6">
            <div className="min-h-0 flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/30">
              {mode === "audio" ? (
                <AudioCallRoom
                  sessionId={session?.sessionId ?? appointmentId ?? ""}
                  iceServers={session?.iceServers}
                  elapsedSeconds={session?.durationSeconds}
                  activeTimingStartedAt={session?.activeTimingStartedAt}
                  purchasedDurationSeconds={session?.purchasedDurationSeconds}
                  onEndCall={() => navigate(-1)}
                />
              ) : (
                <VideoCallRoom
                  sessionId={session?.sessionId ?? appointmentId ?? ""}
                  iceServers={session?.iceServers}
                  elapsedSeconds={session?.durationSeconds}
                  activeTimingStartedAt={session?.activeTimingStartedAt}
                  purchasedDurationSeconds={session?.purchasedDurationSeconds}
                  onEndCall={() => navigate(-1)}
                />
              )}
            </div>

            <aside className="hidden w-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl shadow-black/20 xl:block">
              <ChatPanel sessionId={session?.sessionId ?? appointmentId ?? ""} />
            </aside>
          </div>
        ) : (
          <div className="mx-auto flex h-full max-w-4xl items-center justify-center p-6">
            <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/8 p-8 text-center text-white shadow-2xl backdrop-blur">
              <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-white/10">
                <LoaderCircle className="size-7 animate-spin text-violet-200" />
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-tight">
                Waiting for the other participant
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/70">
                The session will unlock only when both participants are online. This
                helps protect the time purchased for the appointment.
              </p>
              <div className="mt-4 text-xs uppercase tracking-[0.25em] text-white/45">
                {Math.max(0, Math.ceil((session?.remainingSeconds ?? 0) / 60))} minutes protected
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-left text-sm">
                <div className="flex items-center justify-between py-1">
                  <span className="text-white/70">You</span>
                  <span
                    className={
                      (user?.role === "psychologist" ? psychologistOnline : patientOnline)
                        ? "text-emerald-300"
                        : "text-amber-300"
                    }
                  >
                    {(user?.role === "psychologist" ? psychologistOnline : patientOnline)
                      ? "In room"
                      : "Joining..."}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="capitalize text-white/70">{counterpartRole}</span>
                  <span
                    className={
                      (counterpartRole === "patient" ? patientOnline : psychologistOnline)
                        ? "text-emerald-300"
                        : "text-amber-300"
                    }
                  >
                    {(counterpartRole === "patient" ? patientOnline : psychologistOnline)
                      ? "In room"
                      : "Waiting..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Sheet open={chatOpen && bothParticipantsOnline} onOpenChange={setChatOpen}>
        <SheetContent
          side="right"
          className="w-[min(100vw,420px)] border-l border-slate-200 bg-white p-0 sm:max-w-none"
        >
          <SheetHeader className="border-b border-slate-200">
            <SheetTitle>Session Chat</SheetTitle>
            <SheetDescription>
              Stay connected while the session continues.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1">
            <ChatPanel sessionId={session?.sessionId ?? appointmentId ?? ""} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
