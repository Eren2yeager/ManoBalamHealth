import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Award,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  HeartHandshake,
  HeartPulse,
  Leaf,
  MessageCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { getMyAppointments } from "@/features/appointments/api/appointment.api";
import type { AppointmentListItem } from "@/features/appointments/types/appointment.types";
import { listPsychologists } from "@/features/psychologists/api/psychologist.api";
import type { PsychologistListItem } from "@/features/psychologists/types/psychologist.types";
import { formatInViewerTz } from "@/lib/timezone";

const moodOptions = [
  { value: 1, emoji: "😔", label: "Low" },
  { value: 2, emoji: "😕", label: "Meh" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
];

const quickActions = [
  {
    icon: Calendar,
    title: "Book a session",
    subtitle: "Choose a time and consultation mode",
    to: "/book",
    gradient: "from-violet-500 to-purple-600",
    surface: "bg-violet-50 border-violet-100",
  },
  {
    icon: Users,
    title: "Find a psychologist",
    subtitle: "Browse verified professional profiles",
    to: "/psychologists",
    gradient: "from-emerald-500 to-teal-600",
    surface: "bg-emerald-50 border-emerald-100",
  },
  {
    icon: ClipboardList,
    title: "Self-assessment",
    subtitle: "Check in with your mental wellbeing",
    to: "/assessment",
    gradient: "from-blue-500 to-cyan-600",
    surface: "bg-blue-50 border-blue-100",
  },
  {
    icon: HeartPulse,
    title: "Urgent support",
    subtitle: "Request immediate professional help",
    to: "/emergency",
    gradient: "from-rose-500 to-red-600",
    surface: "bg-rose-50 border-rose-100",
  },
];

const wellnessResources = [
  {
    icon: BrainCircuit,
    title: "Anxiety check-in",
    description: "Notice patterns in worry and tension.",
    tag: "Assessment",
    to: "/assessment/anxiety",
    surface: "bg-violet-50 border-violet-100 text-violet-700",
  },
  {
    icon: Activity,
    title: "Stress check-in",
    description: "Reflect on how pressure is affecting you.",
    tag: "Assessment",
    to: "/assessment/stress",
    surface: "bg-blue-50 border-blue-100 text-blue-700",
  },
  {
    icon: Leaf,
    title: "Depression check-in",
    description: "Explore changes in mood and motivation.",
    tag: "Assessment",
    to: "/assessment/depression",
    surface: "bg-emerald-50 border-emerald-100 text-emerald-700",
  },
  {
    icon: HeartHandshake,
    title: "Talk to someone",
    description: "Browse psychologists by your needs.",
    tag: "Professional care",
    to: "/psychologists",
    surface: "bg-amber-50 border-amber-100 text-amber-700",
  },
];

function SectionHeader({
  title,
  description,
  actionLabel,
  actionTo,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-black tracking-tight text-slate-950">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="flex shrink-0 items-center gap-1 text-sm font-bold text-primary transition-all hover:gap-2"
        >
          {actionLabel} <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

function GreetingHero({
  name,
  upcomingCount,
}: {
  name: string;
  upcomingCount: number;
}) {
  const [mood, setMood] = useState<number | null>(null);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50/40 to-white px-4 py-8 md:px-8">
      <div className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-violet-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-blue-300/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-medium text-slate-500">{greeting}</p>
          <h1 className="mt-1 text-3xl font-black tracking-[-0.035em] text-slate-950 md:text-4xl">
            {name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Take a breath. How are you feeling today?
          </p>

          <div className="mt-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Select your mood
            </p>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={mood === option.value}
                  onClick={() => setMood(option.value)}
                  className={`flex min-w-14 flex-col items-center gap-1 rounded-2xl border px-2 py-2.5 transition-all hover:-translate-y-1 ${
                    mood === option.value
                      ? "border-primary/30 bg-white shadow-lg shadow-primary/10 ring-2 ring-primary/15"
                      : "border-transparent bg-white/55 hover:border-violet-100 hover:bg-white"
                  }`}
                >
                  <span className="text-xl">{option.emoji}</span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
            {mood && (
              <p className="mt-3 text-xs font-medium text-primary">
                Mood noted for this visit. You can continue with a guided check-in.
              </p>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-violet-600 to-indigo-700 p-6 text-white shadow-2xl shadow-primary/25 md:p-8">
          <div className="pointer-events-none absolute -right-8 -top-12 size-44 rounded-full bg-white/10 blur-sm" />
          <div className="pointer-events-none absolute -bottom-16 right-1/3 size-36 rounded-full bg-blue-300/15" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden md:inset-y-0 md:left-auto md:right-0 md:w-[52%]">
            <img
              src="/images/home-wellness-dashboard.png"
              alt=""
              className="size-full object-cover object-center opacity-25 md:opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-violet-700 via-violet-700/60 to-violet-800/5" />
          </div>

          <div className="relative grid items-center gap-7 md:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white/75">
                <span className="grid size-9 place-items-center rounded-xl bg-white/15">
                  <Sparkles className="size-4" />
                </span>
                Daily mental wellness check-in
              </div>
              <h2 className="max-w-md text-2xl font-black tracking-tight md:text-3xl">
                Give yourself two quiet minutes.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">
                A guided assessment can help you notice patterns and decide what kind of
                support may feel useful next.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="h-11 rounded-xl bg-white px-5 font-bold text-primary shadow-lg hover:bg-violet-50"
                >
                  <Link to="/assessment">
                    Start check-in <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="h-11 rounded-xl px-4 font-semibold text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/assessment/history">View assessment history</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <Calendar className="mb-3 size-5 text-violet-200" />
                <p className="text-xs text-white/55">Upcoming</p>
                <p className="mt-1 text-lg font-black">{upcomingCount}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <ShieldCheck className="mb-3 size-5 text-emerald-200" />
                <p className="text-xs text-white/55">Care access</p>
                <p className="mt-1 text-sm font-black">Any device</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <MessageCircle className="mb-3 size-5 text-blue-200" />
                <p className="text-xs text-white/55">Modes</p>
                <p className="mt-1 text-sm font-black">Chat · Call</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <Clock3 className="mb-3 size-5 text-amber-200" />
                <p className="text-xs text-white/55">Booking</p>
                <p className="mt-1 text-sm font-black">Flexible</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickActions() {
  return (
    <section className="px-4 py-7 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader title="Quick actions" description="Choose what feels most useful right now." />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {quickActions.map(({ icon: Icon, title, subtitle, to, gradient, surface }) => (
            <Link key={title} to={to} className="group">
              <article
                className={`relative h-full overflow-hidden rounded-3xl border p-5 transition-all hover:-translate-y-2 hover:shadow-xl ${surface}`}
              >
                <span
                  className={`mb-4 grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg transition-transform group-hover:rotate-3 group-hover:scale-110`}
                >
                  <Icon className="size-6" />
                </span>
                <h3 className="text-sm font-black text-slate-900 md:text-base">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
                <ArrowRight className="absolute bottom-4 right-4 size-4 translate-x-1 text-slate-300 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function UpcomingSession({
  appointments,
  isLoading,
}: {
  appointments: AppointmentListItem[];
  isLoading: boolean;
}) {
  const appointment = appointments[0];

  return (
    <section className="px-4 pb-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title="Upcoming session"
          actionLabel="View all"
          actionTo="/appointments"
        />

        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-3xl" />
        ) : appointment ? (
          <article className="flex flex-col gap-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="grid size-15 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-primary text-lg font-black text-white shadow-lg">
                {appointment.otherParty.avatarUrl ? (
                  <img
                    src={appointment.otherParty.avatarUrl}
                    alt={appointment.otherParty.name}
                    className="size-full object-cover"
                  />
                ) : (
                  appointment.otherParty.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-black text-slate-900">
                  {appointment.otherParty.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="size-3.5 text-primary" />
                    {formatInViewerTz(appointment.scheduledAt, "EEE, MMM d · h:mm a")}
                  </span>
                  <span className="flex items-center gap-1.5 capitalize">
                    {appointment.mode === "video" ? (
                      <Video className="size-3.5 text-primary" />
                    ) : (
                      <MessageCircle className="size-3.5 text-primary" />
                    )}
                    {appointment.mode} session
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              <Button asChild variant="outline" className="h-10 rounded-xl">
                <Link to={`/appointments/${appointment.id}`}>View details</Link>
              </Button>
              {["confirmed", "in_progress"].includes(appointment.status) && (
                <Button
                  asChild
                  className="h-10 rounded-xl bg-gradient-to-r from-primary to-violet-600 px-5 font-bold shadow-md"
                >
                  <Link to={`/session/${appointment.id}`}>Open session</Link>
                </Button>
              )}
            </div>
          </article>
        ) : (
          <div className="relative flex flex-col items-center gap-5 overflow-hidden rounded-3xl border border-dashed border-violet-200 bg-gradient-to-br from-violet-50 to-white p-8 text-center md:flex-row md:text-left">
            <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-violet-200/30 blur-2xl" />
            <span className="relative grid size-17 shrink-0 place-items-center rounded-3xl bg-violet-100 text-primary">
              <Calendar className="size-8" />
            </span>
            <div className="relative flex-1">
              <h3 className="text-lg font-black text-slate-900">No upcoming sessions</h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Browse verified psychologists or use automatic matching to find a suitable
                appointment.
              </p>
              <Button
                asChild
                className="mt-4 h-10 rounded-xl bg-gradient-to-r from-primary to-violet-600 px-5 font-bold"
              >
                <Link to="/book">
                  <Plus className="mr-1 size-4" /> Book a session
                </Link>
              </Button>
            </div>
            <div className="relative hidden grid-cols-2 gap-2 text-xs text-slate-500 lg:grid">
              {[
                "Verified profiles",
                "Flexible scheduling",
                "Chat, audio or video",
                "Secure payments",
              ].map((feature) => (
                <span key={feature} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PsychologistCard({ psychologist }: { psychologist: PsychologistListItem }) {
  const initials = psychologist.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link to={`/psychologists/${psychologist.id}`} className="group block h-full">
      <article className="relative h-full overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-2 hover:border-violet-100 hover:shadow-xl hover:shadow-primary/8">
        <div className="mb-4 flex items-start justify-between">
          <div className="relative">
            <div className="grid size-15 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-base font-black text-white shadow-lg">
              {psychologist.avatarUrl ? (
                <img
                  src={psychologist.avatarUrl}
                  alt={psychologist.name}
                  className="size-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <span
              className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white ${
                psychologist.isOnline ? "bg-emerald-500" : "bg-slate-300"
              }`}
              aria-label={psychologist.isOnline ? "Online" : "Offline"}
            />
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
            <Star className="mr-1 inline size-3 fill-current" />
            {psychologist.rating.average.toFixed(1)}
          </span>
        </div>

        <h3 className="truncate font-black text-slate-900">{psychologist.name}</h3>
        <p className="mt-1 text-xs text-slate-500">
          {psychologist.experienceYears} years experience
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {psychologist.specialization.slice(0, 2).map((specialization) => (
            <span
              key={specialization}
              className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold capitalize text-primary"
            >
              {specialization.replaceAll("-", " ")}
            </span>
          ))}
        </div>

        <p className="mt-4 line-clamp-2 text-xs leading-5 text-slate-500">
          {psychologist.bio || "View profile, consultation details, and available slots."}
        </p>

        <span className="mt-5 flex items-center gap-1 text-xs font-bold text-primary transition-all group-hover:gap-2">
          View profile <ArrowRight className="size-3.5" />
        </span>
      </article>
    </Link>
  );
}

function FindPsychologists({
  psychologists,
  isLoading,
}: {
  psychologists: PsychologistListItem[];
  isLoading: boolean;
}) {
  return (
    <section className="px-4 pb-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title="Find a psychologist"
          description="Explore verified professionals and choose someone who fits your needs."
          actionLabel="Browse all"
          actionTo="/psychologists"
        />

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-72 rounded-3xl" />
            ))}
          </div>
        ) : psychologists.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {psychologists.map((psychologist) => (
              <PsychologistCard key={psychologist.id} psychologist={psychologist} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center">
            <Users className="mx-auto size-10 text-violet-300" />
            <p className="mt-3 font-bold text-slate-800">
              Psychologist profiles are not available right now.
            </p>
            <Button asChild variant="outline" className="mt-4 rounded-xl">
              <Link to="/psychologists">Open directory</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function DashboardStats({
  psychologistCount,
  appointmentCount,
  onlineCount,
}: {
  psychologistCount: number;
  appointmentCount: number;
  onlineCount: number;
}) {
  const stats = [
    {
      icon: Award,
      label: "Professionals found",
      value: psychologistCount.toString(),
      gradient: "from-violet-500 to-purple-600",
      surface: "bg-violet-50",
    },
    {
      icon: Calendar,
      label: "Upcoming sessions",
      value: appointmentCount.toString(),
      gradient: "from-blue-500 to-cyan-600",
      surface: "bg-blue-50",
    },
    {
      icon: Activity,
      label: "Online now",
      value: onlineCount.toString(),
      gradient: "from-emerald-500 to-teal-600",
      surface: "bg-emerald-50",
    },
    {
      icon: ShieldCheck,
      label: "Consultation modes",
      value: "3",
      gradient: "from-rose-500 to-pink-600",
      surface: "bg-rose-50",
    },
  ];

  return (
    <section className="px-4 pb-8 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, gradient, surface }) => (
          <div
            key={label}
            className={`${surface} flex items-center gap-4 rounded-3xl border border-white p-5 transition-transform hover:-translate-y-1`}
          >
            <span
              className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
            >
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-xl font-black text-slate-900">{value}</p>
              <p className="text-xs font-semibold text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WellnessResources() {
  return (
    <section className="px-4 pb-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title="Wellness tools"
          description="Small guided steps you can take at your own pace."
          actionLabel="Assessment hub"
          actionTo="/assessment"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {wellnessResources.map(
            ({ icon: Icon, title, description, tag, to, surface }) => (
              <Link key={title} to={to} className="group">
                <article
                  className={`h-full rounded-3xl border p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${surface}`}
                >
                  <Icon className="size-7 transition-transform group-hover:scale-110" />
                  <p className="mt-4 text-base font-black text-slate-900">{title}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
                  <span className="mt-4 inline-block rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold">
                    {tag}
                  </span>
                </article>
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function SupportBanner() {
  return (
    <section className="px-4 pb-12 md:px-8">
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 overflow-hidden rounded-[2rem] bg-gradient-to-r from-primary via-violet-600 to-blue-600 p-7 text-white shadow-2xl shadow-primary/20 md:flex-row">
        <div className="pointer-events-none absolute -left-12 -top-16 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative text-center md:text-left">
          <h2 className="text-2xl font-black">You do not have to do this alone.</h2>
          <p className="mt-2 text-sm text-white/70">
            Choose a psychologist or let ManoBalamHealthCare match you with an available professional.
          </p>
        </div>
        <div className="relative flex flex-wrap justify-center gap-3">
          <Button
            asChild
            className="h-11 rounded-xl bg-white px-6 font-bold text-primary hover:bg-violet-50"
          >
            <Link to="/book">Book a session</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-xl border-white/25 bg-transparent px-5 font-semibold text-white hover:bg-white/10 hover:text-white"
          >
            <Link to="/psychologists">Browse experts</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export const HomePage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [psychologists, setPsychologists] = useState<PsychologistListItem[]>([]);
  const [psychologistTotal, setPsychologistTotal] = useState(0);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [psychologistsLoading, setPsychologistsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadAppointments = async () => {
      try {
        const result = await getMyAppointments({
          page: 1,
          limit: 10,
          upcoming: true,
        });
        if (cancelled) return;
        setAppointments(
          result.items
            .filter((appointment) =>
              ["pending_payment", "confirmed", "in_progress"].includes(
                appointment.status,
              ),
            )
            .sort(
              (first, second) =>
                new Date(first.scheduledAt).getTime() -
                new Date(second.scheduledAt).getTime(),
            ),
        );
      } catch {
        if (!cancelled) setAppointments([]);
      } finally {
        if (!cancelled) setAppointmentsLoading(false);
      }
    };

    const loadPsychologists = async () => {
      try {
        const result = await listPsychologists({
          page: 1,
          limit: 4,
          sortBy: "rating",
        });
        if (cancelled) return;
        setPsychologists(result.items);
        setPsychologistTotal(result.meta.total);
      } catch {
        if (!cancelled) {
          setPsychologists([]);
          setPsychologistTotal(0);
        }
      } finally {
        if (!cancelled) setPsychologistsLoading(false);
      }
    };

    void Promise.all([loadAppointments(), loadPsychologists()]);
    return () => {
      cancelled = true;
    };
  }, []);

  const onlineCount = useMemo(
    () => psychologists.filter((psychologist) => psychologist.isOnline).length,
    [psychologists],
  );

  if (!user) return null;
  if (user.role === "psychologist") {
    return <Navigate to="/psychologist/dashboard" replace />;
  }
  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50/60">
      <GreetingHero name={user.name} upcomingCount={appointments.length} />
      <QuickActions />
      <UpcomingSession appointments={appointments} isLoading={appointmentsLoading} />
      <DashboardStats
        psychologistCount={psychologistTotal}
        appointmentCount={appointments.length}
        onlineCount={onlineCount}
      />
      <FindPsychologists
        psychologists={psychologists}
        isLoading={psychologistsLoading}
      />
      <WellnessResources />
      <SupportBanner />
    </div>
  );
};
