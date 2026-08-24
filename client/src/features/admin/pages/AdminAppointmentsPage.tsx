import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { formatInViewerTz } from "@/lib/timezone";
import type { AppointmentStatus } from "@/types/global.types";
import { AdminMetricCard, AdminWorkspaceHeader } from "../components/AdminWorkspaceHeader";
import { AdminUserLink } from "../components/AdminUserLink";
import { getAdminAppointments } from "../api/admin.api";
import type { AdminAppointmentItem } from "../types/admin.types";

const appointmentStatuses: Array<"all" | AppointmentStatus> = [
  "all",
  "pending_payment",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
];

const statusTone: Record<AppointmentStatus, string> = {
  pending_payment: "bg-orange-100 text-orange-700 ring-orange-100",
  confirmed: "bg-blue-100 text-blue-700 ring-blue-100",
  in_progress: "bg-violet-100 text-violet-700 ring-violet-100",
  completed: "bg-emerald-100 text-emerald-700 ring-emerald-100",
  cancelled: "bg-rose-100 text-rose-700 ring-rose-100",
  no_show: "bg-slate-100 text-slate-700 ring-slate-200",
  refunded: "bg-amber-100 text-amber-700 ring-amber-100",
};

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AdminAppointmentItem[]>([]);
  const [status, setStatus] = useState<"all" | AppointmentStatus>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAdminAppointments({
        page: 1,
        limit: 100,
        ...(status !== "all" ? { status } : {}),
      });
      setAppointments(result.items);
    } catch {
      toast.error("Unable to load admin appointments.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAppointments();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadAppointments]);

  const visibleAppointments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return appointments;
    return appointments.filter((appointment) => {
      const haystack = [
        appointment.patient.name,
        appointment.psychologist.name,
        appointment.status,
        appointment.id,
      ].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [appointments, search]);

  const summary = useMemo(() => ({
    total: appointments.length,
    confirmed: appointments.filter((item) => item.status === "confirmed").length,
    inProgress: appointments.filter((item) => item.status === "in_progress").length,
    completed: appointments.filter((item) => item.status === "completed").length,
    needsReview: appointments.filter((item) => item.status === "cancelled" || item.status === "no_show").length,
  }), [appointments]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AdminWorkspaceHeader
          icon={CalendarDays}
          eyebrow="Appointment operations"
          title="Platform appointments"
          description="Monitor care appointments across patients and psychologists, identify exceptions, and move quickly into the right operational workspace."
          actions={(
            <Button
              onClick={() => void loadAppointments()}
              className="h-11 rounded-xl bg-white px-5 font-bold text-primary hover:bg-violet-50"
            >
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
          )}
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <AdminMetricCard icon={CalendarDays} label="Loaded appointments" value={summary.total} note="Current filtered API window" tone="bg-violet-100 text-violet-700" />
          <AdminMetricCard icon={Clock3} label="Confirmed" value={summary.confirmed} note="Scheduled and ready" tone="bg-blue-100 text-blue-700" />
          <AdminMetricCard icon={Stethoscope} label="In progress" value={summary.inProgress} note="Care currently active" tone="bg-indigo-100 text-indigo-700" />
          <AdminMetricCard icon={CheckCircle2} label="Completed" value={summary.completed} note="Eligible for reporting/payout review" tone="bg-emerald-100 text-emerald-700" />
          <AdminMetricCard icon={ShieldAlert} label="Needs review" value={summary.needsReview} note="Cancelled or no-show cases" tone="bg-rose-100 text-rose-700" />
        </section>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 rounded-xl pl-9"
                placeholder="Search patient, psychologist, status, or appointment ID"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as "all" | AppointmentStatus)}
              className="h-11 rounded-xl border border-input bg-background px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-violet-100"
            >
              {appointmentStatuses.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All statuses" : formatStatus(item)}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-100 shadow-sm">
          <CardContent className="p-0">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-black text-slate-950">Appointment directory</h2>
              <p className="mt-1 text-sm text-slate-500">
                Use this workspace for operational visibility. Refund-specific action remains in Payments & Refunds.
              </p>
            </div>

            {loading ? (
              <div className="grid min-h-72 place-items-center">
                <div className="text-center">
                  <LoaderCircle className="mx-auto size-8 animate-spin text-primary" />
                  <p className="mt-3 text-sm font-semibold text-slate-500">Loading appointments...</p>
                </div>
              </div>
            ) : visibleAppointments.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <CalendarDays className="mx-auto size-12 text-violet-300" />
                <h3 className="mt-4 text-lg font-black text-slate-950">No appointments found</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Try changing the status filter or search term. New bookings will appear here once they are created.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {visibleAppointments.map((appointment) => (
                  <article
                    key={appointment.id}
                    className="grid gap-5 px-6 py-5 transition-colors hover:bg-violet-50/30 xl:grid-cols-[1.5fr_1.5fr_1fr_auto] xl:items-center"
                  >
                    <div className="min-w-0">
                      <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[.12em] text-slate-400">
                        <UserRound className="size-3.5" />
                        Patient
                      </p>
                      <AdminUserLink {...appointment.patient} />
                    </div>

                    <div className="min-w-0">
                      <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[.12em] text-slate-400">
                        <Stethoscope className="size-3.5" />
                        Psychologist
                      </p>
                      <AdminUserLink {...appointment.psychologist} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-950">
                        {formatInViewerTz(appointment.scheduledAt)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Appointment ID: {appointment.id}</p>
                    </div>

                    <Badge className={`w-fit rounded-full px-3 py-1 text-xs font-black capitalize ring-1 ${statusTone[appointment.status]}`}>
                      {formatStatus(appointment.status)}
                    </Badge>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
