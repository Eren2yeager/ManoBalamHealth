import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  Check,
  HeartHandshake,
  LockKeyhole,
  MessageCircleHeart,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutoTimeWindowPicker } from "../components/AutoTimeWindowPicker";
import { ConsultationTypePicker } from "../components/ConsultationTypePicker";
import { ConcernForm } from "../components/ConcernForm";
import { BookingSummary } from "../components/BookingSummary";
import { useBookingStore } from "../store/bookingStore";
import { getBookingSettings } from "../api/booking.api";

type Step = "type" | "schedule" | "concern" | "summary";

const STEP_CONFIG: Record<
  Step,
  { label: string; description: string; icon: typeof HeartHandshake }
> = {
  type: {
    label: "Session type",
    description: "Chat, audio, or secure video",
    icon: MessageCircleHeart,
  },
  schedule: {
    label: "Schedule",
    description: "Select a comfortable date and time",
    icon: CalendarCheck2,
  },
  concern: {
    label: "Your needs",
    description: "Share only what feels helpful",
    icon: Stethoscope,
  },
  summary: {
    label: "Confirm",
    description: "Review and complete secure payment",
    icon: ShieldCheck,
  },
};

const STEPS: Step[] = ["type", "schedule", "concern", "summary"];

export const BookingFlowPage = () => {
  const [step, setStep] = useState<Step>("type");
  const [showScheduleSelection, setShowScheduleSelection] = useState(true);
  const {
    mode,
    preferredWindow,
    reset,
  } = useBookingStore();

  const visibleSteps = useMemo(
    () => showScheduleSelection ? STEPS : STEPS.filter((item) => item !== "schedule"),
    [showScheduleSelection],
  );
  const currentIndex = visibleSteps.indexOf(step);
  const proceedHint = useMemo(() => {
    if (step === "type" && !mode) return "Select chat, audio, or video to continue.";
    if (step === "schedule") {
      if (!(preferredWindow?.from && preferredWindow?.to)) return "Pick your preferred date and time window.";
    }
    return "Ready for the next step.";
  }, [mode, preferredWindow, step]);

  useEffect(() => {
    let active = true;
    void getBookingSettings()
      .then((settings) => {
        if (!active) return;
        setShowScheduleSelection(settings.showScheduleSelection);
        if (!settings.showScheduleSelection && step === "schedule") {
          setStep("concern");
        }
      })
      .catch(() => {
        if (active) setShowScheduleSelection(true);
      });
    return () => {
      active = false;
    };
  }, [step]);

  useEffect(
    () => () => {
      reset();
    },
    [reset],
  );

  const canProceed = () => {
    if (step === "type") return Boolean(mode);
    if (step === "schedule") {
      return Boolean(preferredWindow?.from && preferredWindow?.to);
    }
    return true;
  };

  const nextStep = () => {
    if (currentIndex < visibleSteps.length - 1) {
      setStep(visibleSteps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    if (currentIndex > 0) setStep(visibleSteps[currentIndex - 1]);
  };

  const renderStep = () => {
    switch (step) {
      case "type":
        return <ConsultationTypePicker />;
      case "schedule":
        return <AutoTimeWindowPicker />;
      case "concern":
        return <ConcernForm />;
      case "summary":
        return <BookingSummary onBack={prevStep} />;
    }
  };

  const CurrentIcon = STEP_CONFIG[step].icon;

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[radial-gradient(circle_at_8%_0%,rgba(221,214,254,.7),transparent_27%),radial-gradient(circle_at_95%_12%,rgba(191,219,254,.45),transparent_24%),#faf9ff] px-4 py-7 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#17142f] px-6 py-8 text-white shadow-[0_25px_70px_-35px_rgba(76,29,149,.8)] md:px-10">
          <div className="absolute -right-12 -top-20 size-72 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="absolute bottom-0 right-10 hidden items-end gap-4 opacity-70 lg:flex">
            <span className="grid size-24 place-items-center rounded-t-[2.5rem] bg-white/8">
              <HeartHandshake className="size-10 text-violet-300" />
            </span>
            <span className="grid size-36 place-items-center rounded-t-[3.5rem] bg-white/10">
              <CalendarCheck2 className="size-14 text-blue-200" />
            </span>
            <span className="grid size-20 place-items-center rounded-t-[2rem] bg-white/8">
              <LockKeyhole className="size-8 text-emerald-200" />
            </span>
          </div>
          <div className="relative max-w-3xl animate-in fade-in slide-in-from-bottom-3 duration-700">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-violet-200">
              <Sparkles className="size-3.5" />
              Secure care booking
            </span>
            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Your next step, made calm and simple
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-violet-100/70">
              Choose the support that fits you, share what feels helpful, and
              confirm the priority-matched session through a protected payment process.
            </p>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-3xl border border-violet-100 bg-white/90 p-5 shadow-sm backdrop-blur lg:sticky lg:top-24">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">
              Booking progress
            </p>
            <div className="mt-5 space-y-1">
              {visibleSteps.map((item, index) => {
                const config = STEP_CONFIG[item];
                const Icon = config.icon;
                const active = item === step;
                const complete = index < currentIndex;
                return (
                  <button
                    type="button"
                    key={item}
                    disabled={!complete}
                    onClick={() => complete && setStep(item)}
                    className={`flex w-full items-start gap-3 rounded-2xl p-3 text-left transition ${
                      active
                        ? "bg-violet-50"
                        : complete
                          ? "hover:bg-slate-50"
                          : "opacity-55"
                    }`}
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                        active
                          ? "bg-violet-600 text-white"
                          : complete
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {complete ? (
                        <Check className="size-4" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                    </span>
                    <span>
                      <span className="block text-sm font-black text-slate-900">
                        {config.label}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">
                        {config.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
              <p className="flex items-center gap-2 text-xs font-black text-emerald-800">
                <LockKeyhole className="size-4" />
                Private by design
              </p>
              <p className="mt-2 text-[11px] leading-5 text-emerald-700/80">
                Your concern and booking details are shared only where needed
                to provide care.
              </p>
            </div>

            <div className="mt-3 rounded-2xl bg-violet-50 p-4">
              <p className="flex items-center gap-2 text-xs font-black text-violet-800">
                <HelpCircle className="size-4" />
                Not sure who to choose?
              </p>
              <p className="mt-2 text-[11px] leading-5 text-violet-700/80">
                {showScheduleSelection
                  ? "You can choose a preferred window; booking is still assigned automatically by priority and availability."
                  : "Admin has hidden patient schedule selection, so the app assigns the next suitable priority-based slot from psychologist availability."}
              </p>
              <Link
                to="/psychologists"
                className="mt-3 inline-flex items-center gap-1 text-xs font-black text-violet-700 hover:gap-2"
              >
                View psychologists <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </aside>

          <section className="min-w-0 rounded-[2rem] border border-violet-100 bg-white/95 p-5 shadow-xl shadow-violet-100/40 backdrop-blur sm:p-7 md:p-9">
            <div className="mb-7 flex items-center gap-4 border-b border-slate-100 pb-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                <CurrentIcon className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-violet-600">
                  Step {currentIndex + 1} of {visibleSteps.length}
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {STEP_CONFIG[step].label}
                </h2>
              </div>
            </div>

            <div className="min-h-[390px] animate-in fade-in slide-in-from-bottom-2 duration-500">
              {renderStep()}
            </div>

            {step !== "summary" && (
              <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="outline"
                  disabled={currentIndex === 0}
                  onClick={prevStep}
                  className="h-11 rounded-xl px-5 font-bold"
                >
                  <ArrowLeft className="mr-2 size-4" />
                  Back
                </Button>
                <div className="flex flex-col items-stretch gap-2 sm:items-end">
                  <p className={`text-xs font-semibold ${canProceed() ? "text-emerald-600" : "text-slate-500"}`}>
                    {proceedHint}
                  </p>
                  <Button
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 font-bold shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700"
                  >
                    Continue
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};
