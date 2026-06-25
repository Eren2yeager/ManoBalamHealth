import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ReportsChart } from "../components/ReportsChart";
import { getAdminReports, getAdminAppointments } from "../api/admin.api";
import type { AdminReport, AdminAppointmentItem } from "../types/admin.types";
import { toast } from "sonner";
import { AlertCircle, RefreshCw, Sparkles, Calendar, Stethoscope, CheckCircle2, CircleDollarSign } from "lucide-react";

const initialEndDate = new Date().toISOString().split("T")[0];
const initialStartDate = new Date(
  new Date().getTime() - 30 * 24 * 60 * 60 * 1000,
).toISOString().split("T")[0];

const statusTone: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-violet-100 text-violet-700",
  cancelled: "bg-rose-100 text-rose-700",
  refunded: "bg-amber-100 text-amber-700",
  pending_payment: "bg-orange-100 text-orange-700",
};

export function AdminReportsPage() {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const [report, setReport] = useState<AdminReport | null>(null);
  const [appointments, setAppointments] = useState<AdminAppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [reportData, appointmentsData] = await Promise.all([
        getAdminReports(startDate, endDate),
        getAdminAppointments({ page: 1, limit: 100 }),
      ]);
      setReport(reportData);
      setAppointments(appointmentsData.items);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load reports";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchData();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchData]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-[2rem]" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-3xl" />
            ))}
          </div>
          <ReportsChart data={null} isLoading />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="grid min-h-[60vh] place-items-center">
          <Card className="max-w-xl rounded-[2rem]">
            <CardContent className="p-9 text-center">
              <AlertCircle className="mx-auto size-12 text-rose-500" />
              <h2 className="mt-4 text-xl font-black text-slate-950">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-slate-500">{error}</p>
              <Button onClick={fetchData} className="mt-6 h-11 rounded-xl">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      icon: Calendar,
      label: "Total Appointments",
      value: report?.totalAppointments ?? 0,
      tone: "bg-violet-100 text-violet-700",
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      value: report?.completedAppointments ?? 0,
      tone: "bg-emerald-100 text-emerald-700",
    },
    {
      icon: CircleDollarSign,
      label: "Revenue",
      value: `₹${(report?.totalRevenue ?? 0).toLocaleString("en-IN")}`,
      tone: "bg-amber-100 text-amber-700",
    },
    {
      icon: Stethoscope,
      label: "Psychologists",
      value: report?.totalPsychologists ?? 0,
      tone: "bg-blue-100 text-blue-700",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-r from-violet-600 via-primary to-indigo-700 p-7 text-white shadow-xl md:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-white/10 blur-3xl" />
          
          <div className="relative">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-violet-100">
              <span className="grid size-9 place-items-center rounded-xl bg-white/15">
                <Sparkles className="size-4" />
              </span>
              Reports & Analytics
            </div>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-[-0.035em] md:text-4xl">
                  Platform Performance
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-violet-100/80">
                  View key metrics and appointment history for your selected date range.
                </p>
              </div>
              <Button
                onClick={fetchData}
                className="h-11 rounded-xl bg-white px-6 font-bold text-primary hover:bg-violet-50"
              >
                <RefreshCw className="mr-2 size-4" />
                Refresh
              </Button>
            </div>
          </div>
        </section>

        {/* Date Filter */}
        <Card className="rounded-[2rem] border border-slate-100 bg-white shadow-sm">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon: Icon, label, value, tone }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1"
            >
              <span className={`grid size-12 place-items-center rounded-2xl ${tone}`}>
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-xs font-bold text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reports Chart */}
        <ReportsChart data={report} />

        {/* Appointments Table */}
        <Card className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_18px_50px_rgba(45,30,91,.06)">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white pb-6 pt-6">
            <CardTitle className="text-lg font-black tracking-tight text-slate-950">
              Appointments
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Recent appointments across the platform
            </p>
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-4 py-4">Patient</th>
                    <th className="px-4 py-4">Psychologist</th>
                    <th className="px-4 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center">
                        <p className="text-sm text-slate-500">
                        No appointments found for this period
                      </p>
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appt) => (
                      <tr key={appt.id} className="transition-colors hover:bg-violet-50/35">
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-slate-800">
                            {new Date(appt.scheduledAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {new Date(appt.scheduledAt).toLocaleTimeString(
                              undefined,
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                          {appt.patient.name}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                          {appt.psychologist.name}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ring-1 ${
                              statusTone[appt.status] ?? "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {appt.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
