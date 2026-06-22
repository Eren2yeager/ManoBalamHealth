import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Banknote,
  BriefcaseMedical,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  HeartHandshake,
  Languages,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarUpload } from "../components/AvatarUpload";
import { ProfileForm } from "../components/ProfileForm";
import { getMe } from "../api/profile.api";
import type { UserProfile } from "../types/profile.types";
import { toast } from "sonner";
import { getMyPsychologistOnboarding } from "@/features/psychologists/api/psychologist.api";
import type { PsychologistOnboarding } from "@/features/psychologists/types/psychologist.types";

const roleDestinations = {
  patient: {
    label: "View appointments",
    to: "/appointments",
    icon: CalendarDays,
  },
  psychologist: {
    label: "Professional workspace",
    to: "/psychologist/dashboard",
    icon: HeartHandshake,
  },
  admin: {
    label: "Admin dashboard",
    to: "/admin/dashboard",
    icon: ShieldCheck,
  },
} as const;

export const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [professionalProfile, setProfessionalProfile] =
    useState<PsychologistOnboarding | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setLoadFailed(false);
    try {
      const account = await getMe();
      setProfile(account);
      if (account.role === "psychologist") {
        try {
          setProfessionalProfile(await getMyPsychologistOnboarding());
        } catch {
          setProfessionalProfile(null);
          toast.error("Your professional profile summary could not be loaded.");
        }
      } else {
        setProfessionalProfile(null);
      }
    } catch {
      setLoadFailed(true);
      toast.error("We could not load your profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProfile();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadProfile]);

  const completion = useMemo(() => {
    if (!profile) return 0;
    const checks =
      profile.role === "psychologist"
        ? [
            Boolean(profile.name),
            Boolean(profile.avatarUrl),
            Boolean(profile.timezone),
            Boolean(professionalProfile?.bio),
            Boolean(professionalProfile?.specialization.length),
            Boolean(professionalProfile?.languages.length),
            (professionalProfile?.credentials.length ?? 0) >= 3,
            professionalProfile?.onboardingStatus === "approved",
          ]
        : [
            Boolean(profile.name),
            Boolean(profile.email || profile.phone),
            Boolean(profile.age),
            Boolean(profile.gender),
            Boolean(profile.avatarUrl),
            Boolean(profile.emergencyContact),
            Boolean(profile.timezone),
          ];
    return Math.round(
      (checks.filter(Boolean).length / checks.length) * 100,
    );
  }, [professionalProfile, profile]);

  if (isLoading) return <ProfileSkeleton />;

  if (loadFailed || !profile) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#faf9ff] px-4">
        <div className="max-w-md rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-xl">
          <RefreshCcw className="mx-auto size-9 text-rose-500" />
          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Profile unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your account is safe, but we could not load its details right now.
          </p>
          <Button
            onClick={() => void loadProfile()}
            className="mt-6 rounded-xl"
          >
            Try again
          </Button>
        </div>
      </main>
    );
  }

  const destination = roleDestinations[profile.role];
  const DestinationIcon = destination.icon;
  const isPsychologist = profile.role === "psychologist";

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[radial-gradient(circle_at_8%_0%,rgba(221,214,254,.65),transparent_27%),radial-gradient(circle_at_95%_8%,rgba(191,219,254,.4),transparent_24%),#faf9ff] px-4 py-7 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#17142f] px-6 py-8 text-white shadow-[0_25px_70px_-35px_rgba(76,29,149,.8)] md:px-10 md:py-10">
          <div className="absolute -right-20 -top-28 size-80 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="absolute bottom-0 right-8 hidden items-end gap-3 opacity-65 lg:flex">
            <span className="grid size-24 place-items-center rounded-t-[2.4rem] bg-white/8">
              <UserRound className="size-10 text-violet-300" />
            </span>
            <span className="grid size-36 place-items-center rounded-t-[3.5rem] bg-white/10">
              <HeartHandshake className="size-14 text-rose-200" />
            </span>
            <span className="grid size-20 place-items-center rounded-t-[2rem] bg-white/8">
              <ShieldCheck className="size-8 text-emerald-200" />
            </span>
          </div>
          <div className="relative max-w-3xl animate-in fade-in slide-in-from-bottom-3 duration-700">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-violet-200">
              <Sparkles className="size-3.5" />
              {isPsychologist ? "Professional identity" : "Your care account"}
            </span>
            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              {isPsychologist ? (
                <>
                  Build trust through a{" "}
                  <span className="text-violet-300">
                    clear clinical identity
                  </span>
                </>
              ) : (
                <>
                  A profile that keeps your care{" "}
                  <span className="text-violet-300">
                    personal and prepared
                  </span>
                </>
              )}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-violet-100/70">
              {isPsychologist
                ? "Manage your private account details while keeping your qualifications, clinical focus, credentials, and public practice profile clearly organized."
                : "Manage the details used for your account, local scheduling, trusted contact, and personalized ManoBalamHealthCare experience."}
            </p>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[330px_1fr]">
          <aside className="h-fit space-y-5 lg:sticky lg:top-24">
            <section className="overflow-hidden rounded-[2rem] border border-violet-100 bg-white p-6 text-center shadow-xl shadow-violet-100/40">
              <AvatarUpload
                currentAvatarUrl={profile.avatarUrl}
                name={profile.name}
                onAvatarUpdated={(avatarUrl) =>
                  setProfile((current) =>
                    current ? { ...current, avatarUrl } : current,
                  )
                }
              />
              <h2 className="mt-5 text-2xl font-black text-slate-950">
                {profile.name}
              </h2>
              <p className="mt-1 capitalize text-sm font-semibold text-violet-600">
                {profile.role}
              </p>
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-left">
                {profile.email && (
                  <InfoLine icon={Mail} value={profile.email} />
                )}
                {profile.phone && (
                  <InfoLine icon={Phone} value={profile.phone} />
                )}
                <InfoLine icon={MapPin} value={profile.country} />
                <InfoLine icon={Clock3} value={profile.timezone} />
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-6 h-11 w-full rounded-xl border-violet-100 bg-violet-50 font-bold text-violet-700"
              >
                <Link to={destination.to}>
                  <DestinationIcon className="mr-2 size-4" />
                  {destination.label}
                  <ArrowRight className="ml-auto size-4" />
                </Link>
              </Button>
            </section>

            <section className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.13em] text-slate-400">
                    Profile readiness
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-950">
                    {completion}%
                  </p>
                </div>
                <span className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="size-5" />
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full bg-gradient-to-r from-violet-600 to-emerald-500 ${completionWidth(completion)}`} />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                {isPsychologist
                  ? "Professional readiness combines your account, clinical details, credentials, and approval."
                  : "Adding optional details helps keep your account ready for scheduling and support."}
              </p>
            </section>

            <section className="flex gap-3 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" />
              <div>
                <p className="text-sm font-black text-emerald-900">
                  {isPsychologist
                    ? professionalStatusLabel(professionalProfile)
                    : profile.isVerified
                      ? "Verified account"
                      : "Verification pending"}
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-800/75">
                  {isPsychologist
                    ? "Professional verification controls whether patients can discover and book your practice."
                    : "Sensitive account fields cannot be changed from this profile form."}
                </p>
              </div>
            </section>
          </aside>

          <div className="space-y-6">
            {isPsychologist && (
              <PsychologistProfessionalOverview profile={professionalProfile} />
            )}
            <ProfileForm
              profile={profile}
              onUpdated={setProfile}
              professional={isPsychologist}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

function professionalStatusLabel(profile: PsychologistOnboarding | null) {
  if (!profile) return "Professional profile unavailable";
  const labels: Record<PsychologistOnboarding["onboardingStatus"], string> = {
    profile_incomplete: "Professional profile incomplete",
    documents_pending: "Credentials still required",
    under_review: "Professional review in progress",
    approved: "Approved clinical professional",
    rejected: "Professional changes requested",
  };
  return labels[profile.onboardingStatus];
}

function PsychologistProfessionalOverview({
  profile,
}: {
  profile: PsychologistOnboarding | null;
}) {
  if (!profile) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <p className="font-black text-amber-900">
          Professional profile summary unavailable
        </p>
        <p className="mt-2 text-sm leading-6 text-amber-800">
          Your personal account can still be edited below. Open professional
          onboarding to review clinical details and credentials.
        </p>
        <Button asChild className="mt-4 rounded-xl">
          <Link to="/psychologist/onboarding">Open professional onboarding</Link>
        </Button>
      </section>
    );
  }

  const fee = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: profile.consultationFee.currency,
    maximumFractionDigits: 0,
  }).format(profile.consultationFee.amount / 100);
  const verifiedDocuments = profile.credentials.filter(
    (credential) => credential.verified,
  ).length;

  return (
    <section className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm">
      <div className="flex flex-col gap-4 bg-gradient-to-r from-violet-50 via-white to-blue-50/70 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">
            Professional practice profile
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Your clinical identity
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            This information supports verification and forms the professional
            profile patients use when choosing care.
          </p>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-black capitalize ${
            profile.onboardingStatus === "approved"
              ? "bg-emerald-100 text-emerald-700"
              : profile.onboardingStatus === "rejected"
                ? "bg-rose-100 text-rose-700"
                : "bg-violet-100 text-violet-700"
          }`}
        >
          <BadgeCheck className="size-4" />
          {profile.onboardingStatus.replaceAll("_", " ")}
        </span>
      </div>

      <div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-4">
        <ProfessionalMetric
          icon={BriefcaseMedical}
          label="Experience"
          value={`${profile.experienceYears} years`}
          color="violet"
        />
        <ProfessionalMetric
          icon={Banknote}
          label="Consultation fee"
          value={fee}
          color="emerald"
        />
        <ProfessionalMetric
          icon={FileCheck2}
          label="Credentials"
          value={`${profile.credentials.length} uploaded`}
          detail={`${verifiedDocuments} verified`}
          color="blue"
        />
        <ProfessionalMetric
          icon={Star}
          label="Patient rating"
          value={profile.rating.count ? profile.rating.average.toFixed(1) : "New"}
          detail={`${profile.rating.count} reviews`}
          color="amber"
        />
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.13em] text-slate-400">
            Clinical focus
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.specialization.length ? (
              profile.specialization.map((specialization) => (
                <span
                  key={specialization}
                  className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold capitalize text-violet-700"
                >
                  {specialization.replaceAll("-", " ")}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">
                Add your clinical specializations.
              </span>
            )}
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-slate-600">
            <Languages className="size-4 text-blue-600" />
            {profile.languages.length
              ? profile.languages.join(", ")
              : "No languages added"}
          </p>
          {profile.bio && (
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
              {profile.bio}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Button asChild className="h-11 rounded-xl font-bold">
            <Link to="/psychologist/onboarding">
              <Award className="mr-2 size-4" />
              Edit professional profile
            </Link>
          </Button>
          {profile.onboardingStatus === "approved" && (
            <Button asChild variant="outline" className="h-11 rounded-xl font-bold">
              <Link to={`/psychologists/${profile.id}`}>View public profile</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function ProfessionalMetric({
  icon: Icon,
  label,
  value,
  detail,
  color,
}: {
  icon: typeof Award;
  label: string;
  value: string;
  detail?: string;
  color: "violet" | "emerald" | "blue" | "amber";
}) {
  const colors = {
    violet: "bg-violet-100 text-violet-700",
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <div className="flex items-center gap-3 bg-white p-5">
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${colors[color]}`}>
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 font-black text-slate-900">{value}</p>
        {detail && <p className="text-[10px] text-slate-500">{detail}</p>}
      </div>
    </div>
  );
}

function completionWidth(completion: number) {
  if (completion >= 100) return "w-full";
  if (completion >= 85) return "w-11/12";
  if (completion >= 70) return "w-3/4";
  if (completion >= 55) return "w-3/5";
  if (completion >= 40) return "w-1/2";
  if (completion >= 25) return "w-1/3";
  return "w-1/5";
}

function InfoLine({
  icon: Icon,
  value,
}: {
  icon: typeof Mail;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-500">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-slate-50 text-violet-600">
        <Icon className="size-3.5" />
      </span>
      <span className="min-w-0 truncate">{value}</span>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-[#faf9ff] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Skeleton className="h-72 rounded-[2rem]" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[330px_1fr]">
          <Skeleton className="h-[560px] rounded-[2rem]" />
          <div className="space-y-6">
            <Skeleton className="h-72 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
            <div className="flex justify-center">
              <LoaderCircle className="size-6 animate-spin text-violet-600" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
