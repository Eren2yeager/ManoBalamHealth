import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeIndianRupee,
  Banknote,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getMyAppointments } from "@/features/appointments/api/appointment.api";
import type { AppointmentListItem } from "@/features/appointments/types/appointment.types";
import {
  getMyPayoutDetails,
  getMyPsychologistOnboarding,
  type PayoutDetails,
} from "../api/psychologist.api";
import type { PsychologistOnboarding } from "../types/psychologist.types";

const formatRupees = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

const payoutStatusCopy: Record<
  PayoutDetails["status"] | "not_added",
  { label: string; className: string; description: string }
> = {
  not_added: {
    label: "Not added",
    className: "bg-amber-100 text-amber-800",
    description: "Add bank details before payouts can be processed.",
  },
  saved: {
    label: "Ready",
    className: "bg-emerald-100 text-emerald-700",
    description: "Your payout account is saved and ready for admin processing.",
  },
  needs_update: {
    label: "Needs update",
    className: "bg-rose-100 text-rose-700",
    description: "Update your payout details to avoid payment delays.",
  },
  under_review: {
    label: "Under review",
    className: "bg-violet-100 text-violet-700",
    description: "Your payout details are being reviewed.",
  },
};

export function PsychologistEarningsPage() {
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetails | null>(null);
  const [profile, setProfile] = useState<PsychologistOnboarding | null>(null);
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkspace = useCallback(async (quiet = false) => {
    if (quiet) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [payout, onboarding, appointmentResult] = await Promise.allSettled([
        getMyPayoutDetails(),
        getMyPsychologistOnboarding(),
        getMyAppointments({ page: 1, limit: 100 }),
      ]);

      if (payout.status === "fulfilled") setPayoutDetails(payout.value);
      if (onboarding.status === "fulfilled") setProfile(onboarding.value);
      if (appointmentResult.status === "fulfilled") {
        setAppointments(appointmentResult.value.items);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to load payout workspace.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadWorkspace();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadWorkspace]);

  const completedAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status === "completed"),
    [appointments],
  );
  const reviewedAppointments = completedAppointments.filter(
    (appointment) => appointment.feedback,
  );
  const payoutStatus = payoutDetails?.status ?? "not_added";
  const payoutCopy = payoutStatusCopy[payoutStatus];
  const baseFee = profile?.consultationFee?.amount ?? 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid min-h-[65vh] place-items-center">
          <LoaderCircle className="size-8 animate-spin text-violet-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#17142f] px-6 py-8 text-white shadow-[0_24px_70px_-30px_rgba(76,29,149,.65)] sm:px-9 lg:px-10">
          <div className="absolute -right-24 -top-24 -z-10 size-80 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="absolute bottom-0 left-12 -z-10 size-48 rounded-full bg-indigo-500/15 blur-2xl" />
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-violet-200">
                <Sparkles className="size-3.5" />
                Payout workspace
              </span>
              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Track payout readiness without digging through onboarding.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-violet-100/75">
                Review bank setup, completed care activity, and payout readiness from one quiet workspace.
              </p>
            </div>
            <Button
              onClick={() => void loadWorkspace(true)}
              disabled={refreshing}
              className="h-11 w-fit rounded-xl bg-white px-5 font-bold text-violet-800 hover:bg-violet-50"
            >
              {refreshing ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 size-4" />
              )}
              Refresh
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <EarningsMetric
            icon={WalletCards}
            label="Payout status"
            value={payoutCopy.label}
            detail={payoutDetails ? "Bank details on file" : "Setup needed"}
            tone={payoutStatus === "saved" ? "emerald" : "amber"}
          />
          <EarningsMetric
            icon={CalendarCheck2}
            label="Completed"
            value={String(completedAppointments.length)}
            detail="Sessions in loaded history"
            tone="violet"
          />
          <EarningsMetric
            icon={BadgeIndianRupee}
            label="Base fee"
            value={baseFee > 0 ? formatRupees(baseFee) : "Not set"}
            detail="Admin configured"
            tone="blue"
          />
          <EarningsMetric
            icon={CheckCircle2}
            label="Reviewed"
            value={String(reviewedAppointments.length)}
            detail="Completed with feedback"
            tone="emerald"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.17em] text-violet-600">
                  Bank setup
                </p>
                <h2 className="mt-2 text-xl font-black text-slate-950">
                  Payout account
                </h2>
              </div>
              <Badge className={`${payoutCopy.className} rounded-full px-3 py-1 font-black`}>
                {payoutCopy.label}
              </Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              {payoutCopy.description}
            </p>

            {payoutDetails ? (
              <div className="mt-6 grid gap-3 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm">
                <InfoRow label="Account holder" value={payoutDetails.accountHolderName} />
                <InfoRow label="Bank" value={payoutDetails.bankName} />
                <InfoRow label="Account" value={payoutDetails.maskedAccountNumber} />
                <InfoRow label="IFSC" value={payoutDetails.ifscCode} />
                <InfoRow label="Type" value={payoutDetails.accountType} />
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-amber-200 bg-amber-50 p-5 text-amber-900">
                <p className="flex items-center gap-2 font-black">
                  <Banknote className="size-5" />
                  Bank details are missing
                </p>
                <p className="mt-2 text-sm leading-6">
                  Add payout information in your professional details before completed sessions can be processed for payout.
                </p>
              </div>
            )}

            <Button
              asChild
              className="mt-6 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 font-black shadow-lg shadow-violet-200"
            >
              <Link to="/psychologist/onboarding#professional-details">
                Update payout details <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>

          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.17em] text-violet-600">
                  Care activity
                </p>
                <h2 className="mt-2 text-xl font-black text-slate-950">
                  Completed session queue
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Exact payout batches are handled by admin. This view shows completed care activity available from your account.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="h-10 rounded-xl border-violet-200 font-bold text-violet-700 hover:bg-violet-50"
              >
                <Link to="/psychologist/appointments">Open appointments</Link>
              </Button>
            </div>

            <div className="mt-6 divide-y divide-violet-50 overflow-hidden rounded-3xl border border-violet-100">
              {completedAppointments.slice(0, 6).map((appointment) => (
                <div key={appointment.id} className="flex flex-col gap-3 bg-white p-4 sm:flex-row sm:items-center">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                    <Clock3 className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black text-slate-950">
                      {appointment.otherParty.name}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {new Date(appointment.scheduledAt).toLocaleString()} · {appointment.mode}
                    </p>
                  </div>
                  <Badge className="w-fit rounded-full bg-emerald-100 text-emerald-700">
                    Completed
                  </Badge>
                </div>
              ))}

              {completedAppointments.length === 0 && (
                <div className="bg-violet-50/60 p-8 text-center">
                  <ShieldCheck className="mx-auto size-10 text-violet-600" />
                  <h3 className="mt-3 font-black text-slate-950">
                    No completed sessions yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Completed sessions will appear here once appointments are finished.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

type EarningsMetricProps = {
  icon: typeof WalletCards;
  label: string;
  value: string;
  detail: string;
  tone: "violet" | "emerald" | "blue" | "amber";
};

const metricTones: Record<EarningsMetricProps["tone"], string> = {
  violet: "bg-violet-100 text-violet-700",
  emerald: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
};

function EarningsMetric({ icon: Icon, label, value, detail, tone }: EarningsMetricProps) {
  return (
    <div className="group rounded-3xl border border-violet-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{detail}</p>
        </div>
        <span className={`grid size-11 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${metricTones[tone]}`}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-semibold text-emerald-900/70">{label}</span>
      <span className="text-right font-black capitalize text-emerald-950">
        {value || "Not provided"}
      </span>
    </div>
  );
}
