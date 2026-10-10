import {
  CalendarCheck2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  HeartPulse,
  TrendingUp,
  Stethoscope,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminReport } from "../types/admin.types";

interface ReportsChartProps {
  data: AdminReport | null;
  isLoading?: boolean;
}

const formatRevenue = (amountInSmallestUnit: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amountInSmallestUnit / 100);

export function ReportsChart({ data, isLoading = false }: ReportsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
        </CardHeader>
        <CardContent className="space-y-5">
          <Skeleton className="h-4 w-full rounded-full" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Report data is not available.
        </CardContent>
      </Card>
    );
  }

  const totalAppointments = Number(data.totalAppointments) || 0;
  const completedAppointments = Number(data.completedAppointments) || 0;
  const completionRate =
    totalAppointments > 0
      ? Math.min(100, Math.round((completedAppointments / totalAppointments) * 100))
      : 0;
  const remainingAppointments = Math.max(totalAppointments - completedAppointments, 0);
  const completionTone =
    completionRate >= 70
      ? "text-emerald-700 bg-emerald-50 ring-emerald-100"
      : completionRate >= 35
        ? "text-amber-700 bg-amber-50 ring-amber-100"
        : "text-rose-700 bg-rose-50 ring-rose-100";

  const metrics = [
    {
      label: "Total appointments",
      value: totalAppointments.toLocaleString("en-IN"),
      icon: CalendarCheck2,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "Total revenue",
      value: formatRevenue(Number(data.totalRevenue) || 0),
      icon: CircleDollarSign,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Approved psychologists",
      value: (Number(data.totalPsychologists) || 0).toLocaleString("en-IN"),
      icon: Stethoscope,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Registered patients",
      value: (Number(data.totalPatients) || 0).toLocaleString("en-IN"),
      icon: Users,
      tone: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <Card className="overflow-hidden rounded-[2rem] border-violet-100 bg-white shadow-[0_22px_70px_rgba(45,30,91,.08)]">
      <CardHeader className="border-b border-violet-100/70 bg-gradient-to-r from-violet-50 via-white to-indigo-50/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-violet-500">
              Report overview
            </p>
            <CardTitle className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              Appointment performance
            </CardTitle>
          </div>
          <span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-black ring-1 ${completionTone}`}>
            <TrendingUp className="size-4" />
            {completionRate}% completion
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-7 p-5 sm:p-7">
        <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-[#17142f] p-6 text-white shadow-[0_18px_50px_rgba(45,30,91,.16)]">
            <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-violet-500/30 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 size-40 rounded-full bg-blue-400/15 blur-3xl" />
            <div className="relative grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
              <div
                className="grid size-36 place-items-center rounded-full shadow-inner"
                style={{
                  background: `conic-gradient(#a78bfa ${completionRate * 3.6}deg, rgba(255,255,255,.12) 0deg)`,
                }}
                aria-label={`${completionRate}% of appointments completed`}
              >
                <div className="grid size-28 place-items-center rounded-full bg-[#17142f] ring-1 ring-white/10">
                  <div className="text-center">
                    <p className="text-4xl font-black tracking-tight">{completionRate}%</p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[.14em] text-violet-200">
                      complete
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[.14em] text-violet-100">
                  <HeartPulse className="size-3.5" />
                  Care delivery progress
                </p>
                <h3 className="mt-4 text-2xl font-black tracking-tight">
                  {completedAppointments.toLocaleString("en-IN")} of{" "}
                  {totalAppointments.toLocaleString("en-IN")} appointments completed
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-violet-100/70">
                  This shows how many scheduled care interactions have reached completion in the current reporting window.
                </p>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-300 to-emerald-300 transition-all duration-700 ease-out"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {[
              {
                label: "Completed",
                value: completedAppointments,
                icon: ClipboardCheck,
                tone: "bg-emerald-100 text-emerald-700",
              },
              {
                label: "Remaining",
                value: remainingAppointments,
                icon: Clock3,
                tone: "bg-amber-100 text-amber-800",
              },
              {
                label: "Total tracked",
                value: totalAppointments,
                icon: CalendarCheck2,
                tone: "bg-violet-100 text-violet-700",
              },
            ].map(({ label, value, icon: Icon, tone }) => (
              <article
                key={label}
                className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
              >
                <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tone}`}>
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-2xl font-black text-slate-950">
                    {value.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs font-bold text-slate-500">{label}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, tone }) => (
            <div
              key={label}
              className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-100 hover:shadow-md"
            >
              <span className={`mb-4 grid size-10 place-items-center rounded-xl ${tone}`}>
                <Icon className="size-5" />
              </span>
              <p className="text-xl font-black text-slate-950">{value}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
