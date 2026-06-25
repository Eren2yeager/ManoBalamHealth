import {
  CalendarCheck2,
  CircleDollarSign,
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
    <Card>
      <CardHeader>
        <CardTitle>Report overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-7">
        <div>
          <div className="mb-2 flex items-center justify-between gap-4 text-sm">
            <span className="font-semibold text-foreground">Appointment completion</span>
            <span className="font-bold text-primary">{completionRate}%</span>
          </div>
          <progress
            className="h-3 w-full overflow-hidden rounded-full accent-primary"
            max={100}
            value={completionRate}
            aria-label={`${completionRate}% of appointments completed`}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {completedAppointments.toLocaleString("en-IN")} of{" "}
            {totalAppointments.toLocaleString("en-IN")} appointments completed
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-2xl border bg-card p-4">
              <span className={`mb-4 grid size-10 place-items-center rounded-xl ${tone}`}>
                <Icon className="size-5" />
              </span>
              <p className="text-xl font-black text-foreground">{value}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
