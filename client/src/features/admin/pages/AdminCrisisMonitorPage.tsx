import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, HeartHandshake, LoaderCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { formatInViewerTz } from "@/lib/timezone";
import { AdminMetricCard, AdminWorkspaceHeader } from "../components/AdminWorkspaceHeader";
import { AdminUserLink } from "../components/AdminUserLink";
import { getAdminAppointments } from "../api/admin.api";
import type { AdminAppointmentItem } from "../types/admin.types";

export function AdminCrisisMonitorPage() {
  const [appointments, setAppointments] = useState<AdminAppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAdminAppointments({ page: 1, limit: 100 });
      setAppointments(result.items.filter((item) => item.allocationMode === "emergency"));
    } catch {
      toast.error("Unable to load crisis-monitor data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const summary = useMemo(() => ({
    active: appointments.filter((item) => item.status === "confirmed" || item.status === "in_progress").length,
    completed: appointments.filter((item) => item.status === "completed").length,
    unresolved: appointments.filter((item) => item.status === "cancelled" || item.status === "no_show").length,
  }), [appointments]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AdminWorkspaceHeader
          icon={HeartHandshake}
          eyebrow="Crisis oversight"
          title="Emergency care monitor"
          description="Track emergency-allocated appointments so urgent care pathways stay visible to operations."
          actions={<Button onClick={() => void load()} className="h-11 rounded-xl bg-white px-5 font-bold text-primary hover:bg-violet-50"><RefreshCw className="mr-2 size-4" />Refresh</Button>}
        />

        <section className="grid gap-4 sm:grid-cols-3">
          <AdminMetricCard icon={HeartHandshake} label="Active or scheduled" value={summary.active} note="Confirmed or in-progress emergency appointments" tone="bg-violet-100 text-violet-700" />
          <AdminMetricCard icon={RefreshCw} label="Completed" value={summary.completed} note="Emergency care delivered" tone="bg-emerald-100 text-emerald-700" />
          <AdminMetricCard icon={AlertTriangle} label="Needs review" value={summary.unresolved} note="Cancelled or no-show emergency cases" tone="bg-rose-100 text-rose-700" />
        </section>

        <Card className="overflow-hidden border-slate-100 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="grid min-h-72 place-items-center"><LoaderCircle className="size-8 animate-spin text-primary" /></div>
            ) : appointments.length === 0 ? (
              <p className="px-6 py-16 text-center text-sm text-slate-500">No emergency appointments found in the current window.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {appointments.map((item) => (
                  <article key={item.id} className="grid gap-4 px-6 py-5 transition-colors hover:bg-rose-50/30 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
                    <div>
                      <p className="mb-2 text-xs font-black uppercase tracking-[.12em] text-slate-400">Patient</p>
                      <AdminUserLink {...item.patient} />
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-black uppercase tracking-[.12em] text-slate-400">Assigned psychologist</p>
                      <AdminUserLink {...item.psychologist} />
                    </div>
                    <div className="lg:text-right">
                      <Badge className="mb-2 bg-rose-100 text-rose-700 capitalize">{item.status.replaceAll("_", " ")}</Badge>
                      <p className="text-sm font-bold text-slate-900">{formatInViewerTz(item.scheduledAt)}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.mode ?? "session"} emergency allocation</p>
                    </div>
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
