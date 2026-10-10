import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  Clock3,
  CreditCard,
  HeartHandshake,
  HeartPulse,
  Leaf,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { listPsychologists } from "@/features/psychologists/api/psychologist.api";
import type { PsychologistListItem } from "@/features/psychologists/types/psychologist.types";

const revealDelays = [
  "",
  "delay-[70ms]",
  "delay-[140ms]",
  "delay-[210ms]",
  "delay-[280ms]",
  "delay-[350ms]",
];

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  return { ref, visible };
}

function Reveal({
  children,
  delayIndex = 0,
  className = "",
}: {
  children: ReactNode;
  delayIndex?: number;
  className?: string;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
      } ${revealDelays[delayIndex % revealDelays.length]} ${className}`}
    >
      {children}
    </div>
  );
}

function CalmHeroVisual() {
  const floatingIcons = [
    {
      icon: HeartPulse,
      className: "left-[3%] top-[18%] text-rose-500 animation-delay-500",
    },
    {
      icon: BrainCircuit,
      className: "right-[1%] top-[15%] text-primary animation-delay-1000",
    },
    {
      icon: Leaf,
      className: "right-[0%] bottom-[28%] text-emerald-500 animation-delay-1500",
    },
    {
      icon: Sparkles,
      className: "left-[0%] bottom-[31%] text-amber-500",
    },
  ];

  return (
    <div className="relative mx-auto flex min-h-[390px] w-full max-w-[570px] items-end justify-center lg:min-h-[480px]">
      <div className="absolute bottom-4 size-[350px] rounded-full bg-gradient-to-br from-violet-200/80 via-purple-100/80 to-blue-100/60 sm:size-[430px]" />
      <div className="absolute bottom-4 size-[310px] animate-[spin_32s_linear_infinite] rounded-full border border-dashed border-primary/15 sm:size-[390px]" />
      <div className="absolute bottom-4 h-12 w-[88%] rounded-[50%] bg-violet-300/15 blur-xl" />

      {floatingIcons.map(({ icon: Icon, className }) => (
        <span
          key={className}
          className={`absolute z-20 grid size-13 animate-[bounce_3.8s_ease-in-out_infinite] place-items-center rounded-full border border-white bg-white/90 shadow-xl backdrop-blur ${className}`}
        >
          <Icon className="size-6" />
        </span>
      ))}

      <div className="relative z-10 h-[390px] w-[310px] overflow-hidden rounded-[2.75rem] border-[6px] border-white bg-violet-50 shadow-[0_32px_80px_-28px_rgba(109,40,217,0.55)] sm:h-[455px] sm:w-[365px]">
        <img
          src="/images/landing-care-illustration.png"
          alt="A luminous mind garden representing emotional wellbeing, secure support, and personal growth"
          className="size-full object-cover object-center transition-transform duration-700 hover:scale-[1.025] motion-reduce:transition-none"
          fetchPriority="high"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-violet-950/15 to-transparent" />
      </div>

      <svg
        viewBox="0 0 430 455"
        className="hidden"
        role="img"
        aria-label="A calm person sitting in meditation"
      >
        <defs>
          <linearGradient id="sweater" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#6d28d9" />
          </linearGradient>
          <linearGradient id="pants" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#e8e4f7" />
          </linearGradient>
          <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3f2a28" />
            <stop offset="1" stopColor="#19131a" />
          </linearGradient>
        </defs>

        <path
          d="M65 330c28-40 49-76 58-115M365 330c-28-40-49-76-58-115"
          stroke="#a78bfa"
          strokeWidth="6"
          strokeLinecap="round"
          opacity=".35"
        />
        <path
          d="M92 280c-30-22-37-47-27-72 24 8 38 27 40 57M338 280c30-22 37-47 27-72-24 8-38 27-40 57"
          fill="#c4b5fd"
          opacity=".55"
        />
        <path
          d="M104 238c-24-13-35-31-31-52 23 3 39 17 47 41M326 238c24-13 35-31 31-52-23 3-39 17-47 41"
          fill="#ddd6fe"
          opacity=".8"
        />

        <ellipse cx="215" cy="421" rx="158" ry="24" fill="#8b5cf6" opacity=".14" />
        <path
          d="M176 152c-38 20-51 74-41 137l80 28 80-28c10-63-3-117-41-137z"
          fill="url(#sweater)"
        />
        <path d="M171 177c-31 18-59 54-73 96l30 15 52-75z" fill="#8b5cf6" />
        <path d="M259 177c31 18 59 54 73 96l-30 15-52-75z" fill="#7c3aed" />
        <path
          d="M99 271c-22 5-35 20-39 39 17 7 38-1 53-20M331 271c22 5 35 20 39 39-17 7-38-1-53-20"
          fill="none"
          stroke="#d99a72"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <circle cx="58" cy="313" r="11" fill="#d99a72" />
        <circle cx="372" cy="313" r="11" fill="#d99a72" />

        <path
          d="M210 292c-32 27-65 48-105 59-25 7-44 27-49 53 60 13 126-6 171-55z"
          fill="url(#pants)"
        />
        <path
          d="M220 292c32 27 65 48 105 59 25 7 44 27 49 53-60 13-126-6-171-55z"
          fill="url(#pants)"
        />
        <path
          d="M75 397c-24 2-41 12-50 31 27 10 52 8 75-5M355 397c24 2 41 12 50 31-27 10-52 8-75-5"
          fill="#f8fafc"
          stroke="#d8d5e5"
          strokeWidth="4"
        />

        <rect x="196" y="126" width="38" height="43" rx="16" fill="#d99a72" />
        <ellipse cx="215" cy="105" rx="49" ry="57" fill="#e6a47a" />
        <path
          d="M169 113c-7-58 18-88 51-88 42 0 65 34 50 103-6-35-17-58-42-72-12 18-32 32-59 38z"
          fill="url(#hair)"
        />
        <path
          d="M168 94c-17 40-10 97 13 119-4-39 4-70 25-93M265 83c20 44 14 101-8 129 4-40-5-71-24-94"
          fill="none"
          stroke="url(#hair)"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <path d="M190 110q10 7 20 0M222 110q10 7 20 0" fill="none" stroke="#47302e" strokeWidth="3" strokeLinecap="round" />
        <path d="M204 132q12 10 24 0" fill="none" stroke="#8b4d45" strokeWidth="3" strokeLinecap="round" />
        <circle cx="179" cy="118" r="8" fill="#e6a47a" />
        <circle cx="251" cy="118" r="8" fill="#e6a47a" />
      </svg>

      <div className="absolute bottom-15 left-[3%] z-20 rounded-2xl border border-white bg-white/90 p-3 shadow-xl backdrop-blur sm:left-[8%]">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <p className="text-xs font-black text-slate-900">Verified care</p>
            <p className="text-[10px] text-slate-500">Profiles reviewed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const trustItems = [
    { icon: ShieldCheck, title: "Verified experts", text: "Credential-reviewed profiles" },
    { icon: LockKeyhole, title: "Private access", text: "Protected accounts and sessions" },
    { icon: Clock3, title: "Flexible timing", text: "Appointments that fit your day" },
    { icon: HeartHandshake, title: "Human support", text: "Care built around your comfort" },
  ];

  return (
    <section
      id="about"
      className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_70%_35%,#f0e9ff_0%,transparent_36%),linear-gradient(135deg,#fff_0%,#fdfbff_45%,#f7f3ff_100%)] px-4 pb-10 pt-12 md:px-8 lg:pt-16"
    >
      <div className="pointer-events-none absolute -left-48 -top-48 size-[520px] rounded-full bg-violet-200/20 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1.03fr_.97fr]">
        <div className="animate-in fade-in slide-in-from-left-5 duration-700">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700">
            <Sparkles className="size-3.5 fill-current" />
            Thoughtful support for every step
          </span>
          <h1 className="mt-6 max-w-3xl text-balance text-5xl font-black leading-[1.04] tracking-[-0.05em] text-[#10152f] sm:text-6xl lg:text-7xl">
            Your mental wellness,
            <span className="block bg-gradient-to-r from-primary via-violet-600 to-blue-500 bg-clip-text text-transparent">
              our priority
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-slate-600">
            Connect with verified psychologists through chat, audio, or video.
            Choose your time, your professional, and the pace that feels right.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-13 rounded-xl bg-gradient-to-r from-primary to-violet-600 px-7 text-base font-bold shadow-xl shadow-primary/20 transition-transform hover:-translate-y-0.5"
            >
              <Link to="/register">
                <Calendar className="mr-1 size-5" />
                Book a session
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-13 rounded-xl border-violet-200 bg-white px-7 text-base font-bold text-primary hover:bg-violet-50"
            >
              <Link to="/login">
                <MessageCircle className="mr-1 size-5" />
                Talk now
              </Link>
            </Button>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-4">
            {trustItems.map(({ icon: Icon, title, text }, index) => (
              <div
                key={title}
                className={`animate-in fade-in slide-in-from-bottom-3 duration-500 ${revealDelays[index]}`}
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-50 text-primary ring-1 ring-violet-100">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-black text-slate-900">{title}</p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">{text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <CalmHeroVisual />
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Calendar, title: "Choose a time", text: "Select a convenient appointment window.", tone: "bg-violet-100 text-violet-600" },
    { icon: CreditCard, title: "Book and pay", text: "Confirm securely through Razorpay.", tone: "bg-emerald-100 text-emerald-600" },
    { icon: Video, title: "Connect", text: "Meet by chat, audio, or video.", tone: "bg-blue-100 text-blue-600" },
    { icon: HeartPulse, title: "Feel supported", text: "Receive guidance from your psychologist.", tone: "bg-rose-100 text-rose-600" },
    { icon: Leaf, title: "Grow stronger", text: "Continue your wellness journey.", tone: "bg-teal-100 text-teal-600" },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-24 bg-white px-4 py-8 md:px-8">
      <Reveal className="mx-auto max-w-7xl">
        <div className="grid gap-6 rounded-3xl border border-violet-100 bg-white p-6 shadow-[0_18px_55px_rgba(109,40,217,.06)] lg:grid-cols-[220px_1fr] lg:items-center">
          <div className="border-violet-100 lg:border-r lg:pr-7">
            <h2 className="text-xl font-black text-[#10152f]">How ManoBalamHealthCare works</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Five simple steps towards professional support.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map(({ icon: Icon, title, text, tone }, index) => (
              <div key={title} className="group relative">
                <div className="flex gap-3 lg:block">
                  <span className={`grid size-12 shrink-0 place-items-center rounded-full ${tone} transition-transform group-hover:scale-110`}>
                    <Icon className="size-6" />
                  </span>
                  <div className="lg:mt-3">
                    <p className="text-xs font-black text-slate-900">
                      {index + 1}. {title}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">{text}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="absolute -right-2 top-4 hidden size-4 text-violet-200 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const services = [
  { icon: ShieldCheck, title: "First aid support", text: "Immediate guidance and urgent resources.", tone: "bg-rose-100 text-rose-600", to: "/services/first-aid-support" },
  { icon: Video, title: "Psychiatric consultation", text: "Specialist evaluation and care planning.", tone: "bg-blue-100 text-blue-600", to: "/services/psychiatric-consultation" },
  { icon: BrainCircuit, title: "Clinical psychology", text: "Evidence-informed psychological support.", tone: "bg-violet-100 text-violet-600", to: "/services/clinical-psychology" },
  { icon: HeartHandshake, title: "Mental health counselling", text: "A confidential space to talk and grow.", tone: "bg-emerald-100 text-emerald-600", to: "/services/mental-health-counselling" },
];

function ServiceGrid() {
  return (
    <section id="services" className="scroll-mt-24">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-primary">Care options</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[#10152f]">
            Our services
          </h2>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map(({ icon: Icon, title, text, tone, to }, index) => (
          <Reveal key={title} delayIndex={index}>
            <Link to={to} className="group block">
              <article className="flex h-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-violet-100 hover:shadow-lg">
                <span className={`grid size-13 shrink-0 place-items-center rounded-xl ${tone}`}>
                  <Icon className="size-6 transition-transform group-hover:scale-110" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-black text-slate-900">{title}</h3>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">{text}</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </article>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function PsychologistPreviewCard({
  psychologist,
  delayIndex,
}: {
  psychologist: PsychologistListItem;
  delayIndex: number;
}) {
  const initials = psychologist.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Reveal delayIndex={delayIndex}>
      <Link to={`/psychologists/${psychologist.id}`} className="group block h-full">
        <article className="h-full rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:-translate-y-2 hover:border-violet-100 hover:shadow-xl">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-100 to-blue-100">
            <div className="grid h-28 place-items-center">
              {psychologist.avatarUrl ? (
                <img
                  src={psychologist.avatarUrl}
                  alt={psychologist.name}
                  className="size-full object-cover"
                />
              ) : (
                <span className="grid size-17 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-lg font-black text-white shadow-lg">
                  {initials}
                </span>
              )}
            </div>
            <span
              className={`absolute bottom-2 right-2 size-3.5 rounded-full border-2 border-white ${
                psychologist.isOnline ? "bg-emerald-500" : "bg-slate-300"
              }`}
            />
          </div>
          <h3 className="mt-3 truncate text-sm font-black text-slate-900">
            {psychologist.name}
          </h3>
          <p className="mt-1 truncate text-[10px] capitalize text-slate-500">
            {psychologist.specialization[0]?.replaceAll("-", " ") || "Psychologist"}
          </p>
          <p className="mt-2 flex items-center gap-1 text-[10px] font-bold text-slate-600">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {psychologist.rating.average.toFixed(1)} ({psychologist.rating.count} reviews)
          </p>
          <p className="mt-2 text-[10px] font-semibold text-slate-500">
            {psychologist.experienceYears}+ years experience
          </p>
          <div className="mt-3 rounded-lg bg-violet-50 px-2.5 py-2 text-[10px] font-bold text-primary">
            View profile and availability
          </div>
        </article>
      </Link>
    </Reveal>
  );
}

function PsychologistPreview() {
  const [psychologists, setPsychologists] = useState<PsychologistListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await listPsychologists({
          page: 1,
          limit: 4,
          sortBy: "rating",
        });
        if (!cancelled) setPsychologists(result.items);
      } catch {
        if (!cancelled) setPsychologists([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-primary">
            Approved professionals
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[#10152f]">
            Meet our psychologists
          </h2>
        </div>
        <Link
          to="/psychologists"
          className="flex shrink-0 items-center gap-1 text-xs font-bold text-primary transition-all hover:gap-2"
        >
          View all <ArrowRight className="size-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : psychologists.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {psychologists.map((psychologist, index) => (
            <PsychologistPreviewCard
              key={psychologist.id}
              psychologist={psychologist}
              delayIndex={index}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 p-8 text-center">
          <Users className="mx-auto size-8 text-violet-300" />
          <p className="mt-3 text-sm font-bold text-slate-700">
            Psychologist profiles will appear here once available.
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-xl">
            <Link to="/psychologists">Open directory</Link>
          </Button>
        </div>
      )}
    </section>
  );
}

function ServicesAndExperts() {
  return (
    <section className="bg-[#fcfbff] px-4 py-14 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.78fr_1.42fr]">
        <ServiceGrid />
        <PsychologistPreview />
      </div>
    </section>
  );
}

function ProfessionalSection() {
  const benefits = [
    "Verified professional profile",
    "Recurring availability and slot management",
    "Chat, audio, and video consultations",
    "Appointment and session workspace",
  ];

  return (
    <section
      id="for-psychologists"
      className="scroll-mt-24 overflow-hidden bg-slate-950 px-4 py-18 text-white md:px-8"
    >
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_.8fr]">
        <div className="pointer-events-none absolute -right-32 -top-40 size-96 rounded-full bg-violet-600/25 blur-3xl" />
        <Reveal>
          <p className="text-xs font-black uppercase tracking-[.18em] text-violet-300">
            For psychologists
          </p>
          <h2 className="mt-3 max-w-2xl text-balance text-4xl font-black tracking-[-.04em]">
            A focused workspace for thoughtful online care.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            Manage your profile, availability, appointments, and realtime sessions from
            one secure platform.
          </p>
          <Button
            asChild
            className="mt-7 h-12 rounded-xl bg-white px-6 font-bold text-primary hover:bg-violet-50"
          >
            <Link to="/register">
              Join as a psychologist <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </Reveal>
        <Reveal delayIndex={1}>
          <div className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/6 p-4"
              >
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-300" />
                <p className="text-sm leading-6 text-slate-200">{benefit}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Resources() {
  const cards = [
    { icon: BrainCircuit, title: "Anxiety assessment", text: "Reflect on patterns of worry and tension.", to: "/mental-health-assessment", tone: "bg-violet-100 text-violet-600" },
    { icon: HeartPulse, title: "Stress assessment", text: "Check how pressure may be affecting you.", to: "/mental-health-assessment", tone: "bg-rose-100 text-rose-600" },
    { icon: Leaf, title: "Depression assessment", text: "Notice changes in mood and motivation.", to: "/mental-health-assessment", tone: "bg-emerald-100 text-emerald-600" },
  ];

  return (
    <section id="resources" className="scroll-mt-24 bg-white px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal className="text-center">
          <p className="text-xs font-black uppercase tracking-[.18em] text-primary">
            Wellness resources
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#10152f]">
            Start with a guided check-in
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Self-assessments are not a diagnosis, but they can help you notice patterns
            and decide what support to explore next.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, text, to, tone }, index) => (
            <Reveal key={title} delayIndex={index}>
              <Link
                to={to}
                className="group flex h-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <span className={`grid size-13 shrink-0 place-items-center rounded-xl ${tone}`}>
                  <Icon className="size-6 group-hover:scale-110 transition-transform" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="px-4 pb-14 md:px-8">
      <Reveal className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-primary to-blue-600 px-7 py-8 text-white shadow-2xl shadow-primary/20 md:flex-row md:px-12">
        <div className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-5 text-center md:text-left">
          <span className="hidden size-16 place-items-center rounded-3xl bg-white/15 sm:grid">
            <HeartHandshake className="size-8" />
          </span>
          <div>
            <h2 className="text-2xl font-black">You are not alone. We are here for you.</h2>
            <p className="mt-2 text-sm text-white/75">
              Take the first step towards a healthier, more supported you.
            </p>
          </div>
        </div>
        <Button
          asChild
          className="relative h-12 shrink-0 rounded-xl bg-white px-7 font-bold text-primary hover:bg-violet-50"
        >
          <Link to="/register">
            Get started now <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
      </Reveal>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="contact" className="scroll-mt-24 bg-slate-950 px-4 py-12 text-slate-400 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/10 pb-9 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <BrandLogo dark />
            <p className="mt-4 text-sm leading-6">
              Professional mental-health support through flexible booking,
              assessments, and online consultations.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">Explore</h3>
            <div className="grid gap-2.5 text-sm">
              <a href="#how-it-works" className="hover:text-white">How it works</a>
              <a href="#services" className="hover:text-white">Services</a>
              <a href="#resources" className="hover:text-white">Resources</a>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">Account</h3>
            <div className="grid gap-2.5 text-sm">
              <Link to="/login" className="hover:text-white">Log in</Link>
              <Link to="/register" className="hover:text-white">Create account</Link>
              <Link to="/register" className="hover:text-white">Join as psychologist</Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">Urgent help</h3>
            <p className="text-sm leading-6">
              If there is immediate danger, contact local emergency services. In India,
              dial 112.
            </p>
            <Link to="/crisis" className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-rose-300 hover:text-white">
              View crisis resources <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-7 text-xs sm:flex-row sm:justify-between">
          <p>© {year} ManoBalamHealthCare. All rights reserved.</p>
          <p>Empowering your mind with better access to care.</p>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <main>
        <Hero />
        <HowItWorks />
        <ServicesAndExperts />
        <ProfessionalSection />
        <Resources />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
