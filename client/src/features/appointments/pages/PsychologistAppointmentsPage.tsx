import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  LoaderCircle,
  MessageSquareText,
  NotebookPen,
  PlayCircle,
  RefreshCw,
  Sparkles,
  UserRound,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatInViewerTz } from "@/lib/timezone";
import type { AppointmentStatus } from "@/types/global.types";
import { AppointmentStatusBadge } from "../components/AppointmentStatusBadge";
import { getMyAppointments } from "../api/appointment.api";
import type { AppointmentListItem } from "../types/appointment.types";
import { getSessionAccessState } from "../utils/sessionAccess";

type AppointmentWorkspaceTab = "upcoming" | "today" | "active" | "completed" | "past";

const terminalStatuses = new Set<AppointmentStatus>([
  "completed",
  "cancelled",
  "no_show",
  "refunded",
]);

const tabLabels: Array<{ value: AppointmentWorkspaceTab; label: string; hint: string }> = [
  { value: "upcoming", label: "Upcoming", hint: "Future care" },
  { value: "today", label: "Today", hint: "Daily plan" },
  { value: "active", label: "Ready", hint: "Joinable" },
  { value: "completed", label: "Completed", hint: "Finished" },
  { value: "past", label: "Past", hint: "Closed" },
];

const modeStyle = {
  chat: "bg-emerald-50 text-emerald-700 border-emerald-100",
  audio: "bg-blue-50 text-blue-700 border-blue-100",
  video: "bg-violet-50 text-violet-700 border-violet-100",
};

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

const isPast = (appointment: AppointmentListItem) =>
  terminalStatuses.has(appointment.status) ||
  new Date(appointment.scheduledEndsAt).getTime() < Date.now();

export function PsychologistAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<AppointmentWorkspaceTab>("upcoming");

  const loadAppointments = useCallback(async (quiet = false) => {
    if (quiet) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { items } = await getMyAppointments({ page: 1, limit: 100 });
      setAppointments(
        [...items].sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
        ),
      );
    } catch (error) {
      console.error(error);
      toast.error("Unable to load psychologist appointments.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAppointments();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadAppointments]);

  const joinableAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) => getSessionAccessState(appointment).canJoinSession,
      ),
    [appointments],
  );

  const upcomingAppointments = useMemo(
    () => appointments.filter((appointment) => !isPast(appointment)),
    [appointments],
  );

  const visibleAppointments = useMemo(() => {
    switch (activeTab) {
      case "today":
        return appointments.filter(
          (appointment) => isToday(appointment.scheduledAt) && !isPast(appointment),
        );
      case "active":
        return joinableAppointments;
      case "completed":
        return appointments.filter((appointment) => appointment.status === "completed");
      case "past":
        return appointments.filter(isPast);
      case "upcoming":
      default:
        return upcomingAppointments;
    }
  }, [activeTab, appointments, joinableAppointments, upcomingAppointments]);

  const nextSession = upcomingAppointments[0];
  const todayCount = appointments.filter(
    (appointment) => isToday(appointment.scheduledAt) && !isPast(appointment),
  ).length;
  const completedCount = appointments.filter(
    (appointment) => appointment.status === "completed",
  ).length;
  const emergencyCount = appointments.filter(
    (appointment) => appointment.allocationMode === "emergency",
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#17142f] px-6 py-8 text-white shadow-[0_24px_70px_-30px_rgba(76,29,149,.65)] sm:px-9 lg:px-10">
          <div className="absolute -right-24 -top-24 -z-10 size-80 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="absolute bottom-0 left-12 -z-10 size-48 rounded-full bg-indigo-500/15 blur-2xl" />
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-700">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-violet-200">
                <Sparkles className="size-3.5" />
                Care delivery workspace
              </span>
              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Appointments that feel organized before the session begins.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-violet-100/75">
                Review upcoming care, jump into active sessions, and keep notes close without leaving your practice flow.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => void loadAppointments(true)}
                disabled={refreshing}
                className="h-11 rounded-xl bg-white px-5 font-bold text-violet-800 hover:bg-violet-50"
              >
                {refreshing ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 size-4" />
                )}
                Refresh
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-xl border-white/25 bg-white/5 px-5 font-bold text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/psychologist/availability">Manage availability</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AppointmentMetric icon={CalendarDays} label="Today" value={loading ? "..." : String(todayCount)} detail="Sessions scheduled" tone="violet" />
          <AppointmentMetric icon={PlayCircle} label="Ready" value={loading ? "..." : String(joinableAppointments.length)} detail="Can be joined now" tone="emerald" />
          <AppointmentMetric icon={CheckCircle2} label="Completed" value={loading ? "..." : String(completedCount)} detail="In loaded history" tone="blue" />
          <AppointmentMetric icon={HeartHandshake} label="Emergency" value={loading ? "..." : String(emergencyCount)} detail="Urgent appointments" tone="rose" />
        </section>

        {nextSession && (
          <section className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                  <Clock3 className="size-6" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-violet-600">
                    Next care session
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    {nextSession.otherParty.name}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {formatInViewerTz(nextSession.scheduledAt, "EEE, MMM d · h:mm a")} ·{" "}
                    {nextSession.mode} session
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-violet-200 font-bold text-violet-700 hover:bg-violet-50"
                  onClick={() => navigate(`/appointments/${nextSession.id}`)}
                >
                  <NotebookPen className="mr-2 size-4" />
                  Details & notes
                </Button>
                {getSessionAccessState(nextSession).canJoinSession && (
                  <Button
                    className="h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 font-black shadow-lg shadow-violet-200"
                    onClick={() => navigate(`/psychologist/session/${nextSession.id}`)}
                  >
                    <PlayCircle className="mr-2 size-4" />
                    Start session
                  </Button>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="rounded-[2rem] border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as AppointmentWorkspaceTab)}
            className="gap-5"
          >
            <div className="overflow-x-auto pb-1">
              <TabsList className="h-auto min-w-max gap-2 rounded-2xl bg-violet-50 p-1.5">
                {tabLabels.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="h-13 min-w-28 rounded-xl px-4 data-active:bg-white data-active:text-violet-700 data-active:shadow-sm"
                  >
                    <span className="grid text-left">
                      <span className="text-sm font-black">{tab.label}</span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {tab.hint}
                      </span>
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {tabLabels.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-0">
                {loading ? (
                  <AppointmentsLoadingGrid />
                ) : visibleAppointments.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {visibleAppointments.map((appointment) => (
                      <PsychologistAppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                      />
                    ))}
                  </div>
                ) : (
                  <AppointmentsEmptyState activeTab={activeTab} />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </section>
      </div>
    </DashboardLayout>
  );
}

type AppointmentMetricProps = {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  detail: string;
  tone: "violet" | "emerald" | "blue" | "rose";
};

const metricTones: Record<AppointmentMetricProps["tone"], string> = {
  violet: "bg-violet-100 text-violet-700",
  emerald: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  rose: "bg-rose-100 text-rose-700",
};

function AppointmentMetric({ icon: Icon, label, value, detail, tone }: AppointmentMetricProps) {
  return (
    <div className="group rounded-3xl border border-violet-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{detail}</p>
        </div>
        <span className={`grid size-11 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${metricTones[tone]}`}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

function PsychologistAppointmentCard({ appointment }: { appointment: AppointmentListItem }) {
  const navigate = useNavigate();
  const { canJoinSession, isTooEarly, isExpired } = getSessionAccessState(appointment);
  const initials = appointment.otherParty.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sessionState = canJoinSession
    ? "Ready to join"
    : isTooEarly
      ? "Opens 5 min before"
      : isExpired
        ? "Window ended"
        : "Review details";

  return (
    <article className="group flex h-full flex-col rounded-[1.75rem] border border-violet-100 bg-gradient-to-br from-white to-violet-50/45 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100/80">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <Avatar className="size-13 border-4 border-white shadow-sm">
            <AvatarImage src={appointment.otherParty.avatarUrl} alt="" />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 font-black text-white">
              {initials || <UserRound className="size-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black text-slate-950">
              {appointment.otherParty.name}
            </h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {formatInViewerTz(appointment.scheduledAt, "EEE, MMM d · h:mm a")}
            </p>
          </div>
        </div>
        <AppointmentStatusBadge status={appointment.status} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className={`rounded-full px-2.5 py-1 text-xs font-black capitalize ${modeStyle[appointment.mode]}`}
        >
          {appointment.mode === "video" ? (
            <Video className="mr-1 size-3.5" />
          ) : (
            <MessageSquareText className="mr-1 size-3.5" />
          )}
          {appointment.mode}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-full border-violet-100 bg-white px-2.5 py-1 text-xs font-black capitalize text-violet-700"
        >
          {appointment.allocationMode}
        </Badge>
      </div>

      <div className="mt-5 rounded-2xl border border-violet-100 bg-white/80 p-4">
        <p className="flex items-center gap-2 text-sm font-black text-slate-900">
          {canJoinSession ? (
            <PlayCircle className="size-4 text-emerald-600" />
          ) : (
            <Clock3 className="size-4 text-violet-600" />
          )}
          {sessionState}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {canJoinSession
            ? "Both care workspace and private notes are available now."
            : "Open details to review session information and private notes."}
        </p>
      </div>

      {appointment.feedback && (
        <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-3">
          <p className="text-xs font-black text-amber-900">
            Patient feedback · {appointment.feedback.rating}/5
          </p>
          {appointment.feedback.comment && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-amber-800">
              {appointment.feedback.comment}
            </p>
          )}
        </div>
      )}

      <div className="mt-auto grid gap-2 pt-5">
        {canJoinSession && (
          <Button
            className="h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-black shadow-lg shadow-violet-200"
            onClick={() => navigate(`/psychologist/session/${appointment.id}`)}
          >
            <PlayCircle className="mr-2 size-4" />
            {appointment.status === "in_progress" ? "Rejoin session" : "Start session"}
          </Button>
        )}
        <Button
          variant="outline"
          className="h-10 rounded-xl border-violet-200 font-bold text-violet-700 hover:bg-violet-50"
          onClick={() => navigate(`/appointments/${appointment.id}`)}
        >
          <NotebookPen className="mr-2 size-4" />
          Details & notes
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </article>
  );
}

function AppointmentsEmptyState({ activeTab }: { activeTab: AppointmentWorkspaceTab }) {
  const copy = {
    upcoming: {
      title: "No upcoming sessions",
      text: "Fresh availability helps patients book dependable care windows with you.",
      icon: CalendarDays,
    },
    today: {
      title: "No sessions today",
      text: "Your day is clear. Keep your weekly schedule updated for future bookings.",
      icon: Clock3,
    },
    active: {
      title: "No sessions ready right now",
      text: "Join buttons appear when the session access window opens.",
      icon: PlayCircle,
    },
    completed: {
      title: "No completed sessions yet",
      text: "Completed care sessions and patient feedback will collect here.",
      icon: CheckCircle2,
    },
    past: {
      title: "No closed appointments",
      text: "Cancelled, completed, and expired appointments will appear in this view.",
      icon: AlertCircle,
    },
  }[activeTab];
  const Icon = copy.icon;

  return (
    <div className="rounded-[2rem] border border-dashed border-violet-200 bg-violet-50/50 p-8 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-[1.5rem] bg-white text-violet-700 shadow-sm">
        <Icon className="size-7" />
      </span>
      <h3 className="mt-4 text-lg font-black text-slate-950">{copy.title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {copy.text}
      </p>
      <Button
        asChild
        className="mt-6 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 font-bold"
      >
        <Link to="/psychologist/availability">Update availability</Link>
      </Button>
    </div>
  );
}

function AppointmentsLoadingGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-80 animate-pulse rounded-[1.75rem] border border-violet-100 bg-violet-50/60 p-5"
        >
          <div className="flex gap-3">
            <div className="size-13 rounded-2xl bg-violet-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded-full bg-violet-100" />
              <div className="h-3 w-24 rounded-full bg-violet-100" />
            </div>
          </div>
          <div className="mt-8 h-24 rounded-2xl bg-white/80" />
          <div className="mt-5 h-10 rounded-xl bg-violet-100" />
          <div className="mt-2 h-10 rounded-xl bg-white/90" />
        </div>
      ))}
    </div>
  );
}
