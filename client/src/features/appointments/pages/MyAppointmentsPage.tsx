import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarCheck2,
  Clock3,
  MessageCircleHeart,
  PlayCircle,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentList } from "../components/AppointmentList";
import { getMyAppointments } from "../api/appointment.api";
import type { AppointmentListItem } from "../types/appointment.types";
import { getSessionAccessState } from "../utils/sessionAccess";

export const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      getMyAppointments({ page: 1, limit: 100 })
        .then(({ items }) => {
          if (!cancelled) setAppointments(items);
        })
        .catch(() => {
          if (!cancelled) setAppointments([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const stats = useMemo(() => {
    const upcoming = appointments.filter((appointment) =>
      ["pending_payment", "confirmed", "in_progress"].includes(appointment.status),
    );
    const ready = appointments.filter(
      (appointment) => getSessionAccessState(appointment).canJoinSession,
    );
    const completed = appointments.filter(
      (appointment) => appointment.status === "completed",
    );
    const feedbackPending = completed.filter(
      (appointment) => !appointment.hasFeedback,
    );

    return {
      upcoming: upcoming.length,
      ready: ready.length,
      completed: completed.length,
      feedbackPending: feedbackPending.length,
    };
  }, [appointments]);

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Header */}
      <header className="px-4 pt-6 md:px-8 md:pt-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#17142f] px-5 py-7 text-white shadow-[0_24px_70px_-30px_rgba(76,29,149,.65)] sm:px-8">
            <div className="absolute -right-24 -top-24 -z-10 size-80 rounded-full bg-violet-500/25 blur-3xl" />
            <div className="absolute bottom-0 left-12 -z-10 size-48 rounded-full bg-indigo-500/15 blur-2xl" />
            <Button variant="ghost" size="icon" asChild aria-label="Go back" className="rounded-xl">
              <Link to="/home">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-violet-200">
                  <Sparkles className="size-3.5" />
                  Care journey
                </span>
                <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                  Your appointments, sessions, and next steps.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-violet-100/75">
                  Review upcoming care, join eligible sessions, and return to completed appointments when you are ready.
                </p>
              </div>
              <Button
                asChild
                className="h-11 w-fit rounded-xl bg-white px-5 font-black text-violet-800 hover:bg-violet-50"
              >
                <Link to="/book">
                  <Plus className="mr-2 size-4" />
                  Book session
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-7 md:px-8">
        <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PatientAppointmentMetric
            icon={Clock3}
            label="Upcoming"
            value={loading ? "..." : String(stats.upcoming)}
            detail="Scheduled or active"
            tone="violet"
          />
          <PatientAppointmentMetric
            icon={PlayCircle}
            label="Ready"
            value={loading ? "..." : String(stats.ready)}
            detail="Can be joined now"
            tone="emerald"
          />
          <PatientAppointmentMetric
            icon={CalendarCheck2}
            label="Completed"
            value={loading ? "..." : String(stats.completed)}
            detail="Finished sessions"
            tone="blue"
          />
          <PatientAppointmentMetric
            icon={MessageCircleHeart}
            label="Feedback"
            value={loading ? "..." : String(stats.feedbackPending)}
            detail="Waiting for review"
            tone="rose"
          />
        </section>
        <AppointmentList />
      </main>
    </div>
  );
};

type PatientAppointmentMetricProps = {
  icon: typeof Clock3;
  label: string;
  value: string;
  detail: string;
  tone: "violet" | "emerald" | "blue" | "rose";
};

const metricTones: Record<PatientAppointmentMetricProps["tone"], string> = {
  violet: "bg-violet-100 text-violet-700",
  emerald: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  rose: "bg-rose-100 text-rose-700",
};

function PatientAppointmentMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: PatientAppointmentMetricProps) {
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
