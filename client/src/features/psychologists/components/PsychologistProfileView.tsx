import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  BookOpenCheck,
  BriefcaseMedical,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Globe2,
  HeartHandshake,
  Languages,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Video,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";
import type { PsychologistDetail } from "../types/psychologist.types";

interface PsychologistProfileViewProps {
  psychologist: PsychologistDetail;
}

const formatFee = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(amount / 100);

export const PsychologistProfileView = ({
  psychologist,
}: PsychologistProfileViewProps) => {
  const role = useUserStore((state) => state.user?.role);
  const fee = formatFee(
    psychologist.consultationFee.amount,
    psychologist.consultationFee.currency,
  );
  const initials = psychologist.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[radial-gradient(circle_at_8%_0%,rgba(221,214,254,.7),transparent_28%),radial-gradient(circle_at_95%_10%,rgba(191,219,254,.45),transparent_24%),#faf9ff] px-4 py-7 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/psychologists"
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-700"
        >
          <ArrowLeft className="size-4" />
          All psychologists
        </Link>

        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#17142f] p-6 text-white shadow-[0_28px_80px_-38px_rgba(76,29,149,.85)] sm:p-8 lg:p-10">
          <div className="absolute -right-24 -top-32 -z-10 size-[440px] rounded-full bg-violet-500/25 blur-3xl" />
          <div className="absolute bottom-0 right-10 -z-10 hidden items-end gap-3 opacity-50 lg:flex">
            <span className="grid size-24 place-items-center rounded-t-[2.5rem] bg-white/10">
              <MessageCircle className="size-9 text-violet-200" />
            </span>
            <span className="grid size-36 place-items-center rounded-t-[3.5rem] bg-white/10">
              <HeartHandshake className="size-14 text-rose-200" />
            </span>
            <span className="grid size-20 place-items-center rounded-t-[2rem] bg-white/10">
              <ShieldCheck className="size-8 text-emerald-200" />
            </span>
          </div>

          <div className="relative flex flex-col gap-7 lg:max-w-[78%] lg:flex-row lg:items-center">
            <div className="relative w-fit shrink-0">
              <div className="grid size-36 place-items-center overflow-hidden rounded-[2.5rem] border-4 border-white/15 bg-gradient-to-br from-violet-500 to-blue-500 text-3xl font-black shadow-2xl sm:size-44">
                {psychologist.avatarUrl ? (
                  <img
                    src={psychologist.avatarUrl}
                    alt={psychologist.name}
                    className="size-full object-cover"
                  />
                ) : (
                  initials || <UserRound className="size-16" />
                )}
              </div>
              <span
                className={`absolute -bottom-2 -right-2 flex items-center gap-1.5 rounded-full border-4 border-[#17142f] px-3 py-2 text-[11px] font-black ${
                  psychologist.isOnline
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-600 text-slate-100"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    psychologist.isOnline
                      ? "animate-pulse bg-white"
                      : "bg-slate-300"
                  }`}
                />
                {psychologist.isOnline ? "Online now" : "Currently offline"}
              </span>
            </div>

            <div className="min-w-0 animate-in fade-in slide-in-from-bottom-3 duration-700">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-black text-emerald-200">
                  <BadgeCheck className="size-3.5" />
                  Verified psychologist
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-black text-violet-200">
                  <Sparkles className="size-3.5" />
                  ManoBalamHealthCare professional
                </span>
              </div>
              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                {psychologist.name}
              </h1>
              <p className="mt-3 text-sm font-semibold capitalize text-violet-200 sm:text-base">
                {psychologist.specialization
                  .slice(0, 3)
                  .map((item) => item.replaceAll("-", " "))
                  .join(" · ") || "Mental-health professional"}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-violet-100/75">
                <span className="flex items-center gap-1.5">
                  <BriefcaseMedical className="size-4 text-violet-300" />
                  {psychologist.experienceYears} years experience
                </span>
                <span className="flex items-center gap-1.5">
                  <Languages className="size-4 text-blue-300" />
                  {psychologist.languages.slice(0, 4).join(", ") ||
                    "Language details available"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe2 className="size-4 text-emerald-300" />
                  Licensed in{" "}
                  {psychologist.licensedCountries.join(", ") || "supported regions"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 -mt-5 mx-3 grid gap-px overflow-hidden rounded-3xl border border-violet-100 bg-violet-100 shadow-xl shadow-violet-100/50 sm:grid-cols-2 lg:mx-8 lg:grid-cols-4">
          <TrustMetric
            icon={Star}
            label="Patient rating"
            value={
              psychologist.rating.count
                ? psychologist.rating.average.toFixed(1)
                : "New"
            }
            detail={`${psychologist.rating.count} verified reviews`}
            color="amber"
          />
          <TrustMetric
            icon={BriefcaseMedical}
            label="Clinical experience"
            value={`${psychologist.experienceYears}+ years`}
            detail="Professional practice"
            color="violet"
          />
          <TrustMetric
            icon={Banknote}
            label="Session fee"
            value={fee}
            detail="Per consultation"
            color="emerald"
          />
          <TrustMetric
            icon={BadgeCheck}
            label="Verification"
            value="Approved"
            detail="Credentials reviewed"
            color="blue"
          />
        </section>

        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                icon={BookOpenCheck}
                eyebrow="Professional approach"
                title={`About ${psychologist.name.split(" ")[0]}`}
              />
              <p className="mt-6 whitespace-pre-line text-sm leading-8 text-slate-600 sm:text-base">
                {psychologist.bio ||
                  "This professional supports clients through confidential, thoughtful online consultations tailored to their individual needs."}
              </p>
            </section>

            <section className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                icon={HeartHandshake}
                eyebrow="Areas of support"
                title="Clinical specializations"
              />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {psychologist.specialization.length ? (
                  psychologist.specialization.map((specialization, index) => (
                    <div
                      key={specialization}
                      className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-violet-200 hover:bg-violet-50"
                    >
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                          index % 3 === 0
                            ? "bg-violet-100 text-violet-700"
                            : index % 3 === 1
                              ? "bg-blue-100 text-blue-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        <CheckCircle2 className="size-4" />
                      </span>
                      <span className="text-sm font-black capitalize text-slate-800">
                        {specialization.replaceAll("-", " ")}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Specialization details are being updated.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-violet-50/60 p-6 sm:p-8">
              <SectionHeading
                icon={LockKeyhole}
                eyebrow="Your session"
                title="Flexible, private online care"
                color="blue"
              />
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <SessionMode
                  icon={MessageCircle}
                  title="Chat"
                  description="Private text support"
                  color="violet"
                />
                <SessionMode
                  icon={Volume2}
                  title="Audio"
                  description="Voice consultation"
                  color="blue"
                />
                <SessionMode
                  icon={Video}
                  title="Video"
                  description="Face-to-face online"
                  color="emerald"
                />
              </div>
              <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                Available modes depend on the professional’s published schedule.
                Booking and payment confirmation are protected server-side.
              </p>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <section className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-xl shadow-violet-100/50">
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-violet-200">
                  Book a consultation
                </p>
                <p className="mt-3 text-3xl font-black">{fee}</p>
                <p className="mt-1 text-xs text-violet-100/75">per session</p>
              </div>
              <div className="p-6">
                <BookingBenefit
                  icon={CalendarCheck2}
                  title="Choose a convenient time"
                  description="See available appointments in your local timezone."
                />
                <BookingBenefit
                  icon={Clock3}
                  title="Simple guided booking"
                  description="Select a session type, time, and securely confirm."
                />
                <BookingBenefit
                  icon={LockKeyhole}
                  title="Confidential by design"
                  description="Your booking and concern details are handled privately."
                />

                {role === "patient" ? (
                  <Button
                    asChild
                    className="mt-6 h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-black shadow-lg shadow-violet-200"
                  >
                    <Link to={`/book/${psychologist.id}`}>
                      Book a session
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    className="mt-6 h-12 w-full rounded-xl font-black"
                  >
                    <Link to={role === "psychologist" ? "/psychologist/dashboard" : "/home"}>
                      Return to your workspace
                    </Link>
                  </Button>
                )}

                <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
                  You will review all details before payment.
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="flex items-center gap-2 text-sm font-black text-emerald-900">
                <BadgeCheck className="size-4" />
                Verified professional
              </p>
              <p className="mt-2 text-xs leading-5 text-emerald-800/75">
                This profile is visible because the professional’s required
                information and credentials passed administrative review.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
};

function TrustMetric({
  icon: Icon,
  label,
  value,
  detail,
  color,
}: {
  icon: typeof Star;
  label: string;
  value: string;
  detail: string;
  color: "amber" | "violet" | "emerald" | "blue";
}) {
  const colors = {
    amber: "bg-amber-100 text-amber-700",
    violet: "bg-violet-100 text-violet-700",
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <div className="flex items-center gap-3 bg-white p-5">
      <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${colors[color]}`}>
        <Icon className={`size-5 ${color === "amber" ? "fill-current" : ""}`} />
      </span>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-lg font-black text-slate-900">{value}</p>
        <p className="text-[10px] text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  color = "violet",
}: {
  icon: typeof BookOpenCheck;
  eyebrow: string;
  title: string;
  color?: "violet" | "blue";
}) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={`grid size-11 place-items-center rounded-2xl ${
          color === "blue"
            ? "bg-blue-100 text-blue-700"
            : "bg-violet-100 text-violet-700"
        }`}
      >
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>
      </div>
    </div>
  );
}

function SessionMode({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: typeof Video;
  title: string;
  description: string;
  color: "violet" | "blue" | "emerald";
}) {
  const colors = {
    violet: "bg-violet-100 text-violet-700",
    blue: "bg-blue-100 text-blue-700",
    emerald: "bg-emerald-100 text-emerald-700",
  };
  return (
    <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
      <span className={`grid size-10 place-items-center rounded-xl ${colors[color]}`}>
        <Icon className="size-4" />
      </span>
      <p className="mt-4 font-black text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function BookingBenefit({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof CalendarCheck2;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-4 first:pt-0 last:border-0 last:pb-0">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-sm font-black text-slate-900">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}
