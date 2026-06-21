import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BrainCircuit,
  Calendar,
  Check,
  ChevronRight,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isVisible]);

  return { ref, isVisible };
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, isVisible } = useInView();
  const delayClass =
    {
      0: "",
      70: "delay-[70ms]",
      90: "delay-[90ms]",
      100: "delay-100",
      140: "delay-[140ms]",
      180: "delay-[180ms]",
      210: "delay-[210ms]",
      270: "delay-[270ms]",
      280: "delay-[280ms]",
      350: "delay-[350ms]",
      360: "delay-[360ms]",
    }[delay] ?? "";

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 motion-reduce:transform-none motion-reduce:transition-none ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${delayClass} ${className}`}
    >
      {children}
    </div>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="ManoBalam home"
      className="group flex items-center gap-2.5"
    >
      <span className="relative grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:-rotate-3 group-hover:scale-105">
        <BrainCircuit className="size-5" />
      </span>
      <span>
        <span className="block text-base font-black tracking-tight text-slate-950">
          ManoBalam
        </span>
        {!compact && (
          <span className="hidden text-[10px] font-medium text-slate-500 sm:block">
            Strength for your mind
          </span>
        )}
      </span>
    </Link>
  );
}

function HeroArtwork() {
  const orbitItems = [
    { icon: HeartPulse, className: "left-2 top-12 text-rose-500", delayClass: "" },
    { icon: BrainCircuit, className: "right-2 top-8 text-violet-600", delayClass: "animation-delay-500" },
    { icon: Leaf, className: "bottom-14 right-0 text-emerald-500", delayClass: "animation-delay-1000" },
    { icon: Star, className: "bottom-8 left-5 text-amber-500", delayClass: "animation-delay-1500" },
  ];

  return (
    <div className="relative mx-auto flex min-h-[420px] w-full max-w-[520px] items-center justify-center lg:min-h-[540px]">
      <div className="absolute size-[340px] rounded-full bg-gradient-to-br from-violet-200/80 via-blue-100/60 to-pink-100/80 blur-sm sm:size-[430px]" />
      <div className="absolute size-[300px] animate-[spin_28s_linear_infinite] rounded-full border border-dashed border-primary/25 sm:size-[390px]" />

      {orbitItems.map(({ icon: Icon, className, delayClass }) => (
        <div
          key={className}
          className={`absolute z-20 grid size-13 animate-[bounce_3.5s_ease-in-out_infinite] place-items-center rounded-2xl border border-white bg-white/90 shadow-xl backdrop-blur ${className} ${delayClass}`}
        >
          <Icon className="size-6" />
        </div>
      ))}

      <div className="relative z-10 grid size-64 place-items-center rounded-[4rem] bg-gradient-to-br from-violet-600 via-primary to-blue-500 shadow-2xl shadow-primary/25 sm:size-76">
        <div className="absolute inset-3 rounded-[3.4rem] border border-white/20" />
        <div className="relative flex flex-col items-center text-center text-white">
          <span className="mb-5 grid size-24 place-items-center rounded-[2rem] bg-white/15 backdrop-blur-md">
            <BrainCircuit className="size-13" />
          </span>
          <p className="text-2xl font-black">A calmer space</p>
          <p className="mt-2 max-w-48 text-sm leading-relaxed text-white/75">
            Professional support, designed around your comfort.
          </p>
        </div>
      </div>

      <div className="absolute right-3 top-24 z-20 rounded-2xl border border-white bg-white/90 p-3 shadow-xl backdrop-blur sm:right-5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <p className="text-xs font-black text-slate-900">Verified care</p>
            <p className="text-[10px] text-slate-500">Credential reviewed</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-20 left-0 z-20 rounded-2xl border border-white bg-white/90 p-3 shadow-xl backdrop-blur sm:left-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-primary">
            <MessageCircle className="size-5" />
          </span>
          <div>
            <p className="text-xs font-black text-slate-900">Your way</p>
            <p className="text-[10px] text-slate-500">Chat, audio or video</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const trustItems = [
    { icon: ShieldCheck, title: "Verified experts", description: "Admin-reviewed profiles" },
    { icon: LockKeyhole, title: "Private by design", description: "Protected account access" },
    { icon: Clock3, title: "Flexible booking", description: "Choose a suitable slot" },
    { icon: HeartHandshake, title: "Human support", description: "Care built around you" },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#fff_0%,#faf7ff_45%,#f1f7ff_100%)]">
      <div className="pointer-events-none absolute -left-40 -top-40 size-[520px] rounded-full bg-violet-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-20 size-[430px] rounded-full bg-blue-300/15 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl items-center gap-8 px-4 py-16 md:px-8 lg:grid-cols-[1.08fr_.92fr] lg:py-20">
        <div className="max-w-2xl">
          <Badge className="mb-7 h-auto rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-xs font-bold text-violet-700 shadow-sm">
            <Sparkles className="mr-1 size-3.5" />
            Mental wellness support, wherever you are
          </Badge>

          <h1 className="text-balance text-5xl font-black leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
            Feel heard.
            <span className="block bg-gradient-to-r from-primary via-violet-500 to-blue-500 bg-clip-text text-transparent">
              Grow stronger.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-slate-600">
            Connect with verified psychologists for confidential chat, audio, or video
            consultations—on a schedule that works for you.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-14 rounded-2xl bg-gradient-to-r from-primary to-violet-600 px-7 text-base font-bold shadow-xl shadow-primary/25 transition-transform hover:-translate-y-0.5 hover:opacity-90"
            >
              <Link to="/register">
                Start your journey <ArrowRight className="ml-1 size-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-14 rounded-2xl border-2 border-slate-200 bg-white/70 px-7 text-base font-bold text-slate-800 hover:border-primary/30 hover:bg-violet-50 hover:text-primary"
            >
              <a href="#how-it-works">
                See how it works <ChevronRight className="ml-1 size-5" />
              </a>
            </Button>
          </div>

          <p className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
            <Check className="size-4 rounded-full bg-emerald-100 p-0.5 text-emerald-600" />
            Registration takes only a few minutes.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {trustItems.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-white bg-white/65 p-3.5 shadow-sm backdrop-blur transition-transform hover:-translate-y-1"
              >
                <Icon className="mb-2 size-5 text-primary" />
                <p className="text-xs font-extrabold text-slate-900">{title}</p>
                <p className="mt-1 text-[10px] leading-4 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <HeroArtwork />
      </div>
    </section>
  );
}

function ConfidenceStrip() {
  const items = [
    { icon: Award, title: "Credential verification", text: "Psychologists are reviewed before approval." },
    { icon: Calendar, title: "Simple scheduling", text: "Manual selection or automatic matching." },
    { icon: CreditCard, title: "Secure checkout", text: "Integrated Razorpay payment flow." },
    { icon: Video, title: "Flexible sessions", text: "Chat, audio and video consultation modes." },
  ];

  return (
    <section id="about" className="border-y border-slate-100 bg-white py-8">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }, index) => (
          <FadeIn key={title} delay={index * 70}>
            <div className="flex h-full items-start gap-3 rounded-2xl p-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-50 text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-slate-900">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      <Badge className="mb-4 h-auto rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-primary">
        <Sparkles className="mr-1 size-3.5" />
        {eyebrow}
      </Badge>
      <h2 className="text-balance text-4xl font-black tracking-[-0.035em] text-slate-950 md:text-5xl">
        {title}{" "}
        <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          {accent}
        </span>
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-slate-600 md:text-lg">
        {description}
      </p>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Users, label: "Create your account", description: "Register as a patient and complete verification." },
    { icon: BrainCircuit, label: "Choose your support", description: "Browse experts or let ManoBalam find a suitable match." },
    { icon: Calendar, label: "Pick a time", description: "Choose an available slot and consultation mode." },
    { icon: CreditCard, label: "Confirm securely", description: "Review your booking and complete payment." },
    { icon: HeartHandshake, label: "Begin your session", description: "Meet through chat, audio, or video from one private room." },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-20 bg-slate-50/70 px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <SectionHeading
            eyebrow="A simple path to support"
            title="Start feeling supported in"
            accent="five clear steps"
            description="ManoBalam keeps the journey straightforward—from creating your account to meeting your psychologist."
          />
        </FadeIn>

        <div className="relative grid gap-5 md:grid-cols-3 lg:grid-cols-5">
          <div className="absolute left-[10%] right-[10%] top-10 hidden border-t-2 border-dashed border-violet-200 lg:block" />
          {steps.map(({ icon: Icon, label, description }, index) => (
            <FadeIn key={label} delay={index * 90}>
              <article className="group relative z-10 h-full rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/8">
                <span className="mx-auto mb-5 grid size-18 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 to-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:rotate-3 group-hover:scale-105">
                  <Icon className="size-8" />
                </span>
                <span className="absolute right-4 top-4 text-xs font-black text-violet-200">
                  0{index + 1}
                </span>
                <h3 className="font-extrabold text-slate-900">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  const services = [
    { icon: MessageCircle, title: "Online consultation", description: "Speak with a psychologist through chat, audio, or video.", tone: "from-violet-500 to-purple-600" },
    { icon: BrainCircuit, title: "Self-assessments", description: "Check in with guided anxiety, stress, and depression questionnaires.", tone: "from-emerald-500 to-teal-600" },
    { icon: Calendar, title: "Smart booking", description: "Select a psychologist manually or use time-based automatic matching.", tone: "from-blue-500 to-cyan-600" },
    { icon: HeartPulse, title: "Urgent support", description: "Request an immediate session and access crisis resources when needed.", tone: "from-rose-500 to-red-600" },
    { icon: ShieldCheck, title: "Verified professionals", description: "Credential submission and administrator approval are built into the platform.", tone: "from-amber-500 to-orange-600" },
    { icon: Leaf, title: "Continuity of care", description: "Track appointments, revisit assessment history, and share session feedback.", tone: "from-lime-500 to-emerald-600" },
  ];

  return (
    <section id="services" className="scroll-mt-20 bg-white px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <SectionHeading
            eyebrow="Care that meets you where you are"
            title="One platform for your"
            accent="mental wellness journey"
            description="From the first check-in to ongoing sessions, each feature is designed to make professional support easier to reach."
          />
        </FadeIn>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, description, tone }, index) => (
            <FadeIn key={title} delay={index * 70}>
              <article className="group h-full rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-2 hover:border-violet-100 hover:shadow-2xl hover:shadow-primary/8">
                <span className={`mb-5 grid size-14 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg transition-transform group-hover:scale-110`}>
                  <Icon className="size-7" />
                </span>
                <h3 className="text-lg font-black text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                <Link
                  to="/register"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary transition-all group-hover:gap-2"
                >
                  Explore ManoBalam <ArrowRight className="size-4" />
                </Link>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForPsychologists() {
  const benefits = [
    "Create a professional profile with specializations and languages",
    "Set recurring availability and manage appointment slots",
    "Offer chat, audio, and video consultations",
    "Receive appointment reminders and manage session notes",
  ];

  return (
    <section id="for-psychologists" className="scroll-mt-20 overflow-hidden bg-slate-950 px-4 py-24 text-white md:px-8">
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div className="pointer-events-none absolute -right-30 -top-40 size-96 rounded-full bg-violet-600/25 blur-3xl" />
        <FadeIn>
          <Badge className="mb-5 h-auto rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-violet-200">
            <Award className="mr-1 size-3.5" />
            For mental-health professionals
          </Badge>
          <h2 className="max-w-xl text-balance text-4xl font-black tracking-[-0.035em] md:text-5xl">
            Bring your practice closer to the people who need it.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
            ManoBalam gives psychologists a focused workspace for availability,
            appointments, realtime sessions, and emergency support.
          </p>
          <Button
            asChild
            className="mt-8 h-13 rounded-2xl bg-white px-6 font-bold text-slate-950 hover:bg-violet-50"
          >
            <Link to="/register">
              Join as a psychologist <ArrowRight className="ml-1 size-5" />
            </Link>
          </Button>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="relative rounded-[2rem] border border-white/10 bg-white/7 p-7 shadow-2xl backdrop-blur">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-violet-500 text-white">
                <BrainCircuit className="size-6" />
              </span>
              <div>
                <p className="font-black">Professional workspace</p>
                <p className="text-sm text-slate-400">Tools for thoughtful, flexible care</p>
              </div>
            </div>
            <ul className="grid gap-3">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 p-4 text-sm leading-6 text-slate-200"
                >
                  <Check className="mt-0.5 size-5 shrink-0 rounded-full bg-emerald-400/15 p-0.5 text-emerald-300" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function TestimonialSection() {
  const stories = [
    {
      quote: "I could choose the kind of session that felt comfortable and book around my schedule.",
      name: "A flexible care journey",
      icon: Calendar,
    },
    {
      quote: "The step-by-step booking flow made reaching out feel less overwhelming.",
      name: "A gentler first step",
      icon: HeartHandshake,
    },
    {
      quote: "Having assessments and professional support in one place helped me stay consistent.",
      name: "Support beyond one session",
      icon: BrainCircuit,
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white to-violet-50/50 px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <SectionHeading
            eyebrow="Designed around real needs"
            title="Small steps can create"
            accent="meaningful change"
            description="ManoBalam is built to reduce friction at the moments when asking for support can feel hardest."
          />
        </FadeIn>
        <div className="grid gap-5 md:grid-cols-3">
          {stories.map(({ quote, name, icon: Icon }, index) => (
            <FadeIn key={name} delay={index * 90}>
              <article className="h-full rounded-3xl border border-violet-100/70 bg-white p-7 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-violet-50 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="flex gap-0.5 text-amber-400" aria-label="Five-star design goal">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} className="size-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-base leading-7 text-slate-600">“{quote}”</p>
                <p className="mt-5 text-sm font-black text-slate-900">{name}</p>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary via-violet-600 to-blue-600 px-4 py-20 text-white md:px-8">
      <div className="pointer-events-none absolute -left-20 -top-28 size-80 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 size-96 rounded-full bg-white/10 blur-3xl" />
      <FadeIn className="relative mx-auto max-w-4xl text-center">
        <span className="mx-auto mb-6 grid size-18 place-items-center rounded-3xl border border-white/20 bg-white/15 backdrop-blur">
          <HeartPulse className="size-9" />
        </span>
        <h2 className="text-balance text-4xl font-black tracking-[-0.035em] md:text-5xl">
          You do not have to figure everything out alone.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/80">
          Create your account and take the next step at your own pace.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="h-14 rounded-2xl bg-white px-8 text-base font-bold text-primary shadow-xl hover:bg-violet-50"
          >
            <Link to="/register">
              Create an account <ArrowRight className="ml-1 size-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-14 rounded-2xl border-2 border-white/35 bg-transparent px-8 text-base font-bold text-white hover:bg-white/10 hover:text-white"
          >
            <Link to="/login">I already have an account</Link>
          </Button>
        </div>
      </FadeIn>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 px-4 py-12 text-slate-400 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <div className="[&_span]:text-white">
              <Logo />
            </div>
            <p className="mt-4 text-sm leading-6">
              Professional mental-health support through secure booking, flexible
              consultations, and practical wellness tools.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">Explore</h3>
            <div className="grid gap-2.5 text-sm">
              <a href="#how-it-works" className="hover:text-white">How it works</a>
              <a href="#services" className="hover:text-white">Services</a>
              <a href="#for-psychologists" className="hover:text-white">For psychologists</a>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">Account</h3>
            <div className="grid gap-2.5 text-sm">
              <Link to="/login" className="hover:text-white">Log in</Link>
              <Link to="/register" className="hover:text-white">Create account</Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">Need urgent help?</h3>
            <p className="text-sm leading-6">
              If there is immediate danger, contact your local emergency services.
              In India, dial 112.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-7 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} ManoBalam. All rights reserved.</p>
          <p>Built with care for better access to mental-health support.</p>
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
        <ConfidenceStrip />
        <HowItWorks />
        <Services />
        <ForPsychologists />
        <TestimonialSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
