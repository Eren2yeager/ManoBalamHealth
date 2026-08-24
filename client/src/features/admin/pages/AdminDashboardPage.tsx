import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  getAdminAttentionSummary,
  getAdminAppointments,
  getAdminReports,
  getPendingPsychologists,
  refundPayment,
  verifyPsychologist,
  type AdminAttentionSummary,
} from "../api/admin.api";
import { PsychologistVerificationCard } from "../components/PsychologistVerificationCard";
import { RefundModal } from "../components/RefundModal";
import { ReportsChart } from "../components/ReportsChart";
import { AdminUserLink } from "../components/AdminUserLink";
import type {
  AdminAppointmentItem,
  AdminReport,
  PendingPsychologistItem,
  VerifyPsychologistDto,
} from "../types/admin.types";
import { Link } from "react-router-dom";

const statusTone: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-100",
  in_progress: "bg-violet-50 text-violet-700 ring-violet-100",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-100",
  refunded: "bg-amber-50 text-amber-700 ring-amber-100",
  pending_payment: "bg-orange-50 text-orange-700 ring-orange-100",
};

const formatMoney = (amountInPaise: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountInPaise / 100);

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
  delay,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  note: string;
  tone: string;
  delay: string;
}) {
  return (
    <article className={`animate-in fade-in slide-in-from-bottom-3 rounded-3xl border border-white bg-white p-5 shadow-[0_18px_50px_rgba(45,30,91,.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${delay}`}>
      <div className="flex items-start justify-between gap-4">
        <span className={`grid size-12 place-items-center rounded-2xl ${tone}`}>
          <Icon className="size-5" />
        </span>
        <ArrowUpRight className="size-4 text-slate-300" />
      </div>
      <p className="mt-5 text-3xl font-black tracking-tight text-[#111631]">{value}</p>
      <p className="mt-1 text-sm font-black text-slate-800">{label}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
    </article>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof CheckCircle2;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-violet-200 bg-white/70 px-6 py-14 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-emerald-50 text-emerald-600">
        <Icon className="size-8" />
      </span>
      <h3 className="mt-5 text-lg font-black text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export function AdminDashboardPage() {
  const [pendingPsychologists, setPendingPsychologists] = useState<PendingPsychologistItem[]>([]);
  const [report, setReport] = useState<AdminReport | null>(null);
  const [appointments, setAppointments] = useState<AdminAppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AdminAppointmentItem | null>(null);
  const [selectedRefundAppointmentId, setSelectedRefundAppointmentId] = useState<string | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attention, setAttention] = useState<AdminAttentionSummary | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const to = new Date().toISOString();
      const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [psychologists, reportData, appointmentsData, attentionData] = await Promise.all([
        getPendingPsychologists({ page: 1, limit: 50 }),
        getAdminReports(from, to),
        getAdminAppointments({ page: 1, limit: 100 }),
        getAdminAttentionSummary(),
      ]);
      setPendingPsychologists(psychologists.items);
      setReport(reportData);
      setAppointments(appointmentsData.items);
      setAttention(attentionData);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to load dashboard data";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchData(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchData]);

  const cancelledAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status === "cancelled"),
    [appointments],
  );
  const completedCount = appointments.filter((appointment) => appointment.status === "completed").length;

  const handleVerify = async (id: string, payload: VerifyPsychologistDto) => {
    try {
      setIsProcessing(true);
      await verifyPsychologist(id, payload);
      toast.success(payload.decision === "approved" ? "Psychologist approved" : "Review decision saved");
      await fetchData();
    } catch {
      toast.error("Failed to process verification");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessRefund = async (appointmentId: string, reason: string) => {
    try {
      setIsProcessing(true);
      await refundPayment(appointmentId, { reason });
      toast.success("Refund issued successfully");
      await fetchData();
      setShowRefundModal(false);
      setSelectedAppointment(null);
      setSelectedRefundAppointmentId(null);
    } catch {
      toast.error("Failed to process refund");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-72 rounded-[2rem]" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-48 rounded-3xl" />)}
          </div>
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="grid min-h-[60vh] place-items-center">
          <Card className="max-w-xl rounded-3xl">
            <CardContent className="p-9 text-center">
              <AlertCircle className="mx-auto size-12 text-rose-500" />
              <h2 className="mt-4 text-xl font-black">Dashboard data could not be loaded</h2>
              <p className="mt-2 text-sm text-slate-500">{error}</p>
              <Button onClick={fetchData} className="mt-6 rounded-xl"><RefreshCw className="mr-2 size-4" />Try again</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const metrics = [
    { icon: BadgeCheck, label: "Awaiting review", value: pendingPsychologists.length, note: "Professional applications", tone: "bg-violet-100 text-violet-700", delay: "" },
    { icon: CalendarDays, label: "Appointments", value: appointments.length, note: "Current operational window", tone: "bg-blue-100 text-blue-700", delay: "delay-[70ms]" },
    { icon: CheckCircle2, label: "Completed", value: completedCount, note: "Successfully delivered care", tone: "bg-emerald-100 text-emerald-700", delay: "delay-[140ms]" },
    { icon: CircleDollarSign, label: "Revenue", value: formatMoney(report?.totalRevenue ?? 0), note: "Recorded paid payments", tone: "bg-amber-100 text-amber-700", delay: "delay-[210ms]" },
  ];
  const appointmentSummary = {
    active: appointments.filter((appointment) => appointment.status === "confirmed" || appointment.status === "in_progress").length,
    completed: appointments.filter((appointment) => appointment.status === "completed").length,
    attention: appointments.filter((appointment) => appointment.status === "cancelled" || appointment.status === "no_show").length,
  };
  const attentionCards = [
    {
      label: "Professional reviews",
      value: attention?.pendingVerifications ?? pendingPsychologists.length,
      note: "Applications or profile changes waiting for admin decision",
      to: "/admin/verifications",
      icon: BadgeCheck,
      tone: "bg-violet-100 text-violet-700",
    },
    {
      label: "Refund reviews",
      value: attention?.refundReviews ?? cancelledAppointments.length,
      note: "Cancelled care appointments that may need payment action",
      to: "/admin/payments",
      icon: WalletCards,
      tone: "bg-rose-100 text-rose-700",
    },
    {
      label: "Payout actions",
      value: (attention?.payoutReady ?? 0) + (attention?.payoutBlocked ?? 0),
      note: "Ready payouts plus records blocked by missing bank details",
      to: "/admin/payouts",
      icon: CircleDollarSign,
      tone: "bg-amber-100 text-amber-800",
    },
    {
      label: "Support inbox",
      value: attention?.contactNew ?? 0,
      note: "New public contact requests waiting for first review",
      to: "/admin/contact-requests",
      icon: Users,
      tone: "bg-blue-100 text-blue-700",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <section className="relative isolate min-h-72 overflow-hidden rounded-[2.25rem] bg-[#151329] p-7 text-white shadow-[0_30px_90px_rgba(38,24,84,.25)] md:p-10">
          <img src="/images/admin-operations-illustration.png" alt="" className="absolute inset-0 size-full object-cover object-center opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#151329] via-[#151329]/92 to-[#151329]/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151329]/70 via-transparent to-transparent" />
          <div className="relative max-w-2xl animate-in fade-in slide-in-from-left-4 duration-700">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[.18em] backdrop-blur">
              <Sparkles className="size-3.5 text-violet-200" /> ManoBalamHealthCare operations
            </span>
            <h1 className="mt-5 text-balance text-4xl font-black tracking-[-.045em] md:text-5xl">
              Care operations, clearly in view.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-violet-100/75">
              Review professionals, monitor appointments, track platform health, and keep every operational decision connected to safer access to care.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button onClick={fetchData} className="h-11 rounded-xl bg-white px-5 font-black text-primary hover:bg-violet-50">
                <RefreshCw className="mr-2 size-4" /> Refresh workspace
              </Button>
              <span className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-2 text-xs font-bold backdrop-blur">
                <Activity className="size-4 text-emerald-300" /> System overview active
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
        </section>

        <section className="rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-violet-500">Needs attention</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Operational action queue</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Start here when you only have a few minutes. These cards point to the workspaces most likely to need a decision.
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {attentionCards.map(({ icon: Icon, ...card }) => (
              <Link
                key={card.label}
                to={card.to}
                className="group rounded-3xl border border-white bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
              >
                <span className={`grid size-11 place-items-center rounded-2xl ${card.tone}`}>
                  <Icon className="size-5" />
                </span>
                <p className="mt-4 text-2xl font-black text-slate-950">{card.value}</p>
                <p className="mt-1 text-sm font-black text-slate-800 group-hover:text-primary">{card.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{card.note}</p>
              </Link>
            ))}
          </div>
        </section>

        <Tabs defaultValue="overview" className="flex flex-col">
          <div className="sticky top-20 z-20 overflow-hidden rounded-[1.75rem] border border-violet-100 bg-white/92 p-2 shadow-[0_18px_55px_rgba(76,29,149,.14)] backdrop-blur-xl">
            <div className="mb-2 flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-violet-500">Dashboard navigation</p>
                <p className="text-sm font-bold text-slate-600">Switch between overview, reviews, care activity, and refund actions.</p>
              </div>
              <span className="hidden rounded-full bg-violet-50 px-3 py-1 text-[11px] font-black text-violet-700 sm:inline-flex">
                {appointments.length} appointments tracked
              </span>
            </div>
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 md:grid-cols-4">
              {[
                { value: "overview", label: "Overview", hint: "Reports", icon: Activity },
                { value: "verifications", label: "Verifications", hint: "Reviews", icon: BadgeCheck, count: pendingPsychologists.length },
                { value: "appointments", label: "Appointments", hint: "Care activity", icon: CalendarDays, count: appointments.length },
                { value: "refunds", label: "Refunds", hint: "Payment review", icon: WalletCards, count: cancelledAppointments.length },
              ].map(({ value, label, icon: Icon, count }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="min-h-14 rounded-2xl border border-transparent bg-slate-50/60 px-3 py-2 font-bold text-slate-600 transition-all data-active:border-violet-200 data-active:bg-gradient-to-br data-active:from-violet-100 data-active:to-white data-active:text-primary data-active:shadow-sm"
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-white text-violet-600 shadow-sm">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block truncate text-sm">{label}</span>
                    <span className="block truncate text-[10px] font-bold text-slate-400">{value === "appointments" ? "Care activity" : value === "refunds" ? "Payment review" : value === "verifications" ? "Reviews" : "Reports"}</span>
                  </span>
                  {!!count && <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] text-white">{count}</span>}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <ReportsChart data={report} />
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: Users, label: "Patients", value: report?.totalPatients ?? 0, tone: "text-blue-600 bg-blue-50" },
                { icon: Stethoscope, label: "Approved psychologists", value: report?.totalPsychologists ?? 0, tone: "text-violet-600 bg-violet-50" },
                { icon: ShieldCheck, label: "Completion rate", value: `${report?.totalAppointments ? Math.round((report.completedAppointments / report.totalAppointments) * 100) : 0}%`, tone: "text-emerald-600 bg-emerald-50" },
              ].map(({ icon: Icon, label, value, tone }) => (
                <div key={label} className=" relative flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <span className={`grid size-12 place-items-center rounded-2xl ${tone}`}><Icon className="size-5" /></span>
                  <div><p className="text-2xl font-black text-[#111631]">{value}</p><p className="text-xs font-bold text-slate-500">{label}</p></div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="verifications" className="mt-6">
            {pendingPsychologists.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Verification queue is clear" description="Every submitted professional application has been reviewed." />
            ) : (
              <div className="grid gap-5">{pendingPsychologists.map((psychologist) => <PsychologistVerificationCard key={psychologist.id} psychologist={psychologist} onVerify={handleVerify} isProcessing={isProcessing} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <div className="overflow-hidden rounded-[2rem] border border-violet-100 bg-white shadow-[0_22px_70px_rgba(45,30,91,.08)]">
              <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 via-white to-blue-50/70 px-6 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.16em] text-violet-500">Appointment operations</p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Recent care delivery activity</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">A calm operational view of scheduled, active, completed, and exception appointments across the platform.</p>
                  </div>
                  <Button asChild variant="outline" className="h-11 rounded-xl border-violet-200 bg-white font-black text-primary hover:bg-violet-50">
                    <Link to="/admin/appointments">
                      Open full workspace
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Active or scheduled", value: appointmentSummary.active, icon: Clock3, tone: "bg-blue-100 text-blue-700" },
                    { label: "Completed", value: appointmentSummary.completed, icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-700" },
                    { label: "Needs attention", value: appointmentSummary.attention, icon: AlertCircle, tone: "bg-rose-100 text-rose-700" },
                  ].map(({ label, value, icon: Icon, tone }) => (
                    <article key={label} className="rounded-3xl border border-white bg-white/85 p-4 shadow-sm">
                      <span className={`grid size-10 place-items-center rounded-2xl ${tone}`}>
                        <Icon className="size-5" />
                      </span>
                      <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 p-4 sm:p-6">
                {appointments.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-violet-200 bg-violet-50/40 p-12 text-center">
                    <CalendarDays className="mx-auto size-12 text-violet-300" />
                    <p className="mt-4 text-sm font-bold text-slate-600">No appointments found.</p>
                  </div>
                ) : (
                  appointments.slice(0, 8).map((appointment, index) => (
                    <article
                      key={appointment.id}
                      className="animate-in fade-in slide-in-from-bottom-2 grid gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-center"
                      style={{ animationDelay: `${Math.min(index * 35, 240)}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700">
                          <CalendarDays className="size-5" />
                        </span>
                        <div>
                          <p className="text-sm font-black text-slate-900">{new Date(appointment.scheduledAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 className="size-3.5" />{new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-black uppercase tracking-[.14em] text-slate-400">Patient</p>
                        <AdminUserLink {...appointment.patient} compact />
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-black uppercase tracking-[.14em] text-slate-400">Psychologist</p>
                        <AdminUserLink {...appointment.psychologist} compact />
                      </div>
                      <span className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-black capitalize ring-1 ${statusTone[appointment.status] ?? "bg-slate-50 text-slate-600 ring-slate-100"}`}>
                        {appointment.status.replaceAll("_", " ")}
                      </span>
                    </article>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="refunds" className="mt-6">
            {cancelledAppointments.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="No refunds waiting" description="There are no cancelled appointments requiring refund review." />
            ) : (
              <div className="grid gap-4">
                {cancelledAppointments.map((appointment) => (
                  <article key={appointment.id} className="flex flex-col justify-between gap-5 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
                    <div><AdminUserLink {...appointment.patient} /><p className="mt-1 flex items-center gap-1 text-sm text-slate-500">With <AdminUserLink {...appointment.psychologist} compact /></p><p className="mt-2 text-xs text-slate-400">{new Date(appointment.scheduledAt).toLocaleString()}</p></div>
                    <Button onClick={() => { setSelectedAppointment(appointment); setSelectedRefundAppointmentId(appointment.id); setShowRefundModal(true); }} className="rounded-xl bg-rose-600 hover:bg-rose-700"><WalletCards className="mr-2 size-4" />Review refund</Button>
                  </article>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <RefundModal
        isOpen={showRefundModal}
        onClose={() => { setShowRefundModal(false); setSelectedAppointment(null); setSelectedRefundAppointmentId(null); }}
        appointment={selectedAppointment}
        appointmentId={selectedRefundAppointmentId}
        onProcess={handleProcessRefund}
        isProcessing={isProcessing}
      />
    </DashboardLayout>
  );
}
