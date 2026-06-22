import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmergencyRequestModal } from "@/features/emergency/components/EmergencyRequestModal";
import { useEmergencyStore } from "@/features/emergency/store/emergencyStore";
import { usePsychologistPresenceToggle } from "@/features/psychologists/hooks/usePresence";
import { useAuth } from "@/hooks/useAuth";
import { getMyPsychologistOnboarding } from "../api/psychologist.api";
import type {
  PsychologistCredential,
  PsychologistOnboarding,
} from "../types/psychologist.types";

const requiredCredentialTypes: PsychologistCredential["type"][] = [
  "license",
  "degree",
  "id_proof",
];

const statusDetails = {
  profile_incomplete: {
    label: "Profile incomplete",
    description: "Complete your professional details to continue verification.",
    tone: "border-amber-200 bg-amber-50 text-amber-800",
  },
  documents_pending: {
    label: "Documents pending",
    description: "Upload the required credentials before submitting for review.",
    tone: "border-amber-200 bg-amber-50 text-amber-800",
  },
  under_review: {
    label: "Under review",
    description: "Your application is being reviewed by the ManoBalam team.",
    tone: "border-violet-200 bg-violet-50 text-violet-800",
  },
  approved: {
    label: "Verified professional",
    description: "Your profile is approved and can be visible to patients.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  rejected: {
    label: "Changes requested",
    description: "Review the feedback, update your profile, and submit again.",
    tone: "border-rose-200 bg-rose-50 text-rose-800",
  },
} as const;

export const PsychologistDashboard = () => {
  const { user } = useAuth();
  const { toggleOnline } = usePsychologistPresenceToggle();
  const incomingRequest = useEmergencyStore((state) => state.incomingRequest);
  const [isOnline, setIsOnline] = useState(false);
  const [onboarding, setOnboarding] =
    useState<PsychologistOnboarding | null>(null);

  useEffect(() => {
    let active = true;

    void getMyPsychologistOnboarding()
      .then((profile) => {
        if (active) setOnboarding(profile);
      })
      .catch(() => toast.error("Unable to load verification status."));

    return () => {
      active = false;
    };
  }, []);

  const isApproved = onboarding?.onboardingStatus === "approved";
  const status = onboarding
    ? statusDetails[onboarding.onboardingStatus]
    : statusDetails.profile_incomplete;

  const uploadedCredentialTypes = useMemo(
    () => new Set(onboarding?.credentials.map((credential) => credential.type)),
    [onboarding],
  );

  const uploadedCredentials = requiredCredentialTypes.filter((type) =>
    uploadedCredentialTypes.has(type),
  ).length;
  const missingFieldCount = onboarding?.missingFields.length ?? 0;
  const profileCompletion = onboarding
    ? Math.max(20, Math.min(100, 100 - missingFieldCount * 12))
    : 20;

  const readinessItems = [
    {
      label: "Professional profile",
      detail:
        missingFieldCount === 0
          ? "All required profile details are complete."
          : `${missingFieldCount} required ${missingFieldCount === 1 ? "field" : "fields"} remaining.`,
      complete: missingFieldCount === 0,
    },
    {
      label: "Credentials uploaded",
      detail: `${uploadedCredentials} of ${requiredCredentialTypes.length} required document types uploaded.`,
      complete: uploadedCredentials === requiredCredentialTypes.length,
    },
    {
      label: "Clinical verification",
      detail: isApproved
        ? "Approved by the ManoBalam review team."
        : onboarding?.onboardingStatus === "under_review"
          ? "Application is currently under review."
          : "Submit the completed profile for review.",
      complete: isApproved,
    },
  ];

  const handleToggleOnline = (online: boolean) => {
    if (!isApproved) {
      toast.error("Admin approval is required before you can go online.");
      return;
    }

    setIsOnline(online);
    toggleOnline(online);
    toast.success(
      online
        ? "You're now online and visible to patients."
        : "You're now offline.",
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#17142f] px-6 py-8 text-white shadow-[0_24px_70px_-30px_rgba(76,29,149,.65)] sm:px-9 sm:py-10 lg:min-h-[330px] lg:px-12">
          <img
            src="/images/psychologist-practice-illustration.png"
            alt=""
            className="absolute inset-y-0 right-0 -z-10 hidden h-full w-[58%] object-cover object-right opacity-85 lg:block"
          />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_25%,rgba(139,92,246,.3),transparent_32%)]" />
          <div className="absolute inset-y-0 right-[42%] -z-10 hidden w-48 bg-gradient-to-r from-[#17142f] to-transparent lg:block" />

          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-violet-200">
              <Sparkles className="size-3.5" />
              Psychologist workspace
            </div>
            <h1 className="mt-5 max-w-xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              Welcome back,{" "}
              <span className="text-violet-300">
                {user?.name?.split(" ")[0] ?? "Doctor"}
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-violet-100/75 sm:text-base">
              Organize your practice, stay ready for sessions, and provide
              thoughtful care from one calm, secure workspace.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                className="h-11 rounded-xl bg-white px-5 font-bold text-violet-800 hover:bg-violet-50"
              >
                <Link
                  to={
                    isApproved
                      ? "/psychologist/appointments"
                      : "/psychologist/onboarding"
                  }
                >
                  {isApproved ? "View appointments" : "Complete verification"}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              {isApproved && (
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-xl border-white/25 bg-white/5 px-5 font-bold text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/psychologist/availability">Manage availability</Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={BadgeCheck}
            label="Verification"
            value={status.label}
            detail={isApproved ? "Practice is active" : "Approval required"}
            accent="violet"
          />
          <MetricCard
            icon={FileCheck2}
            label="Credentials"
            value={`${uploadedCredentials}/${requiredCredentialTypes.length}`}
            detail="Required document types"
            accent="blue"
          />
          <MetricCard
            icon={UserRoundCheck}
            label="Profile readiness"
            value={`${profileCompletion}%`}
            detail={
              missingFieldCount === 0
                ? "Required details complete"
                : `${missingFieldCount} fields remaining`
            }
            accent="amber"
          />
          <MetricCard
            icon={isOnline ? Wifi : WifiOff}
            label="Patient visibility"
            value={isOnline ? "Online" : "Offline"}
            detail={
              isApproved
                ? isOnline
                  ? "Patients can find you"
                  : "Not currently visible"
                : "Unlocks after approval"
            }
            accent={isOnline ? "emerald" : "slate"}
          />
        </section>

        <section
          className={`flex flex-col gap-5 rounded-3xl border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 ${status.tone}`}
        >
          <div className="flex gap-3">
            {isApproved ? (
              <CheckCircle2 className="mt-0.5 size-6 shrink-0" />
            ) : onboarding?.onboardingStatus === "rejected" ? (
              <AlertCircle className="mt-0.5 size-6 shrink-0" />
            ) : (
              <ShieldCheck className="mt-0.5 size-6 shrink-0" />
            )}
            <div>
              <h2 className="font-black">{status.label}</h2>
              <p className="mt-1 text-sm leading-6 opacity-80">
                {onboarding?.onboardingStatus === "rejected" &&
                onboarding.rejectionReason
                  ? onboarding.rejectionReason
                  : status.description}
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="shrink-0 rounded-xl border-current bg-white/70 font-bold hover:bg-white"
          >
            <Link to="/psychologist/onboarding">
              {isApproved ? "View profile" : "Open onboarding"}
            </Link>
          </Button>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
          <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm">
            <div className="flex flex-col gap-5 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-white p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.17em] text-violet-600">
                  Live availability
                </p>
                <h2 className="mt-2 text-xl font-black text-slate-900">
                  Control your patient visibility
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your weekly schedule still determines which appointment
                  times patients can book.
                </p>
              </div>
              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${
                  isOnline
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    isOnline ? "animate-pulse bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                {isOnline ? "Online now" : "Currently offline"}
              </span>
            </div>
            <div className="p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleToggleOnline(true)}
                  disabled={!isApproved}
                  className={`group flex min-h-28 items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isOnline
                      ? "border-emerald-300 bg-emerald-50 shadow-sm"
                      : "border-slate-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/50"
                  }`}
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Wifi className="size-5" />
                  </span>
                  <span>
                    <span className="block font-black text-slate-900">
                      Go online
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Become visible to patients seeking support.
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleOnline(false)}
                  disabled={!isApproved}
                  className={`group flex min-h-28 items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                    !isOnline
                      ? "border-violet-200 bg-violet-50 shadow-sm"
                      : "border-slate-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/50"
                  }`}
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                    <WifiOff className="size-5" />
                  </span>
                  <span>
                    <span className="block font-black text-slate-900">
                      Go offline
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Pause discovery without changing your schedule.
                    </span>
                  </span>
                </button>
              </div>
              {!isApproved && (
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                  <AlertCircle className="size-4 shrink-0" />
                  Patient visibility unlocks after your professional profile is
                  approved.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.17em] text-violet-600">
              Practice readiness
            </p>
            <h2 className="mt-2 text-xl font-black text-slate-900">
              Your verification journey
            </h2>
            <div className="mt-6 space-y-5">
              {readinessItems.map((item, index) => (
                <div key={item.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-black ${
                        item.complete
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-violet-100 text-violet-700"
                      }`}
                    >
                      {item.complete ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    {index < readinessItems.length - 1 && (
                      <span className="mt-2 h-full min-h-7 w-px bg-violet-100" />
                    )}
                  </div>
                  <div className="pb-2">
                    <h3 className="font-black text-slate-900">{item.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.17em] text-violet-600">
                Practice tools
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                Everything your day needs
              </h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <WorkspaceCard
              icon={CalendarDays}
              title="Appointments"
              description="Review upcoming sessions and revisit your completed consultations."
              to="/psychologist/appointments"
              action="View schedule"
              locked={!isApproved}
              color="violet"
            />
            <WorkspaceCard
              icon={Clock3}
              title="Availability"
              description="Shape your weekly calendar and publish convenient consultation slots."
              to="/psychologist/availability"
              action="Manage slots"
              locked={!isApproved}
              color="blue"
            />
            <WorkspaceCard
              icon={HeartHandshake}
              title="Professional profile"
              description="Keep your credentials, clinical focus, languages, and biography current."
              to="/psychologist/onboarding"
              action="Open profile"
              locked={false}
              color="rose"
            />
          </div>
        </section>
      </div>

      {incomingRequest && <EmergencyRequestModal request={incomingRequest} />}
    </DashboardLayout>
  );
};

type MetricCardProps = {
  icon: typeof BadgeCheck;
  label: string;
  value: string;
  detail: string;
  accent: "violet" | "blue" | "amber" | "emerald" | "slate";
};

const metricAccents: Record<MetricCardProps["accent"], string> = {
  violet: "bg-violet-100 text-violet-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  slate: "bg-slate-100 text-slate-600",
};

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  accent,
}: MetricCardProps) {
  return (
    <div className="group rounded-3xl border border-violet-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-2xl font-black capitalize text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-2xl transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105 ${metricAccents[accent]}`}
        >
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

type WorkspaceCardProps = {
  icon: typeof CalendarDays;
  title: string;
  description: string;
  to: string;
  action: string;
  locked: boolean;
  color: "violet" | "blue" | "rose";
};

const workspaceColors: Record<WorkspaceCardProps["color"], string> = {
  violet: "bg-violet-100 text-violet-700",
  blue: "bg-blue-100 text-blue-700",
  rose: "bg-rose-100 text-rose-700",
};

function WorkspaceCard({
  icon: Icon,
  title,
  description,
  to,
  action,
  locked,
  color,
}: WorkspaceCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span
          className={`grid size-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${workspaceColors[color]}`}
        >
          <Icon className="size-5" />
        </span>
        {locked && (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-700">
            Approval required
          </span>
        )}
      </div>
      <h3 className="mt-6 text-lg font-black text-slate-900">{title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
        {description}
      </p>
      <span
        className={`mt-5 inline-flex items-center gap-2 text-sm font-black ${
          locked ? "text-slate-400" : "text-violet-700"
        }`}
      >
        {locked ? "Complete verification first" : action}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </>
  );

  if (locked) {
    return (
      <div className="group rounded-3xl border border-violet-100 bg-white p-6 opacity-75 shadow-sm">
        {content}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className="group rounded-3xl border border-violet-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/70"
    >
      {content}
    </Link>
  );
}
