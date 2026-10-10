import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  PlayCircle,
  User,
  Video,
  Clock3,
  Calendar,
  CreditCard,
  AlertCircle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatInViewerTz } from "@/lib/timezone";
import { useUserStore } from "@/stores/userStore";
import { getAppointmentById } from "../api/appointment.api";
import {
  AppointmentStatusBadge,
  canCancelAppointment,
} from "../components/AppointmentStatusBadge";
import { CancelAppointmentDialog } from "../components/CancelAppointmentDialog";
import type { AppointmentDetail } from "../types/appointment.types";
import type { ConsultationMode } from "@/types/global.types";
import { RetryPaymentButton } from "@/features/payment/components/RetryPaymentButton";
import { getSessionAccessState } from "../utils/sessionAccess";

const MODE_CONFIG: Record<
  ConsultationMode,
  { label: string; icon: typeof MessageSquare; color: string; bg: string }
> = {
  chat: { label: "Chat", icon: MessageSquare, color: "text-emerald-700", bg: "bg-emerald-50" },
  audio: { label: "Audio", icon: Phone, color: "text-blue-700", bg: "bg-blue-50" },
  video: { label: "Video", icon: Video, color: "text-violet-700", bg: "bg-violet-50" },
};

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount / 100);

const DetailSkeleton = () => (
  <div className="space-y-4 sm:space-y-6">
    <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Skeleton className="size-16 rounded-[1.5rem] sm:size-24" />
        <div className="space-y-2 flex-1 sm:space-y-3">
          <Skeleton className="h-6 w-40 sm:h-8 sm:w-48" />
          <Skeleton className="h-4 w-48 sm:h-5 sm:w-56" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-20 rounded-full sm:h-6 sm:w-24" />
            <Skeleton className="h-5 w-16 rounded-full sm:h-6 sm:w-20" />
          </div>
        </div>
      </div>
    </div>
    <Skeleton className="h-36 w-full rounded-[2rem] sm:h-48" />
    <Skeleton className="h-32 w-full rounded-[2rem] sm:h-40" />
  </div>
);

export const AppointmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);

  const loadAppointment = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const data = await getAppointmentById(id);
      setAppointment(data);
    } catch (error) {
      toast.error("Failed to load appointment");
      console.error(error);
      navigate("/appointments");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAppointment();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadAppointment]);

  if (!id) {
    return null;
  }

  const otherParty =
    user?.role === "psychologist" ? appointment?.patient : appointment?.psychologist;

  const modeConfig = appointment ? MODE_CONFIG[appointment.mode] : null;
  const ModeIcon = modeConfig?.icon ?? MessageSquare;
  const sessionAccess = appointment ? getSessionAccessState(appointment) : null;
  const canOpenSession = sessionAccess?.canJoinSession ?? false;
  const sessionPath =
    user?.role === "psychologist"
      ? `/psychologist/session/${appointment?.id ?? ""}`
      : `/session/${appointment?.id ?? ""}`;

  const initials =
    otherParty?.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "";

  return (
    <div className="min-h-screen bg-slate-50/60">
      <header className="sticky top-0 z-20 ">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 md:px-8">
          <Button variant="ghost" size="icon" asChild aria-label="Back to appointments" className="rounded-xl">
            <Link to="/appointments">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">Appointment details</h1>
            <p className="text-sm text-slate-500">
              View and manage your session details
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:space-y-6 sm:py-8 md:px-8">
        {isLoading || !appointment ? (
          <DetailSkeleton />
        ) : (
          <>
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
              <div className="pointer-events-none absolute -right-10 -top-10 size-24 rounded-full bg-violet-300/20 blur-2xl sm:-right-16 sm:-top-16 sm:size-40" />
              <div className="pointer-events-none absolute -left-10 -bottom-10 size-20 rounded-full bg-blue-300/15 blur-2xl sm:-left-16 sm:-bottom-16 sm:size-32" />

              <div className="relative flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center">
                <div className="flex flex-shrink-0 items-center justify-center">
                  <Avatar className="size-16 border-4 border-white shadow-lg sm:size-24">
                    {otherParty?.avatarUrl ? (
                      <AvatarImage src={otherParty.avatarUrl} alt={otherParty.name} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-500 text-xl font-black text-white sm:text-2xl">
                      {initials || <User className="size-6 sm:size-10" />}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="min-w-0 flex-1 space-y-2 sm:space-y-3">
                  <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                    {otherParty?.name}
                  </h2>
                  
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock3 className="size-3.5 text-primary sm:size-4" />
                      <span className="font-medium">
                        {formatInViewerTz(appointment.scheduledAt, "EEEE, MMMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="size-3.5 text-primary sm:size-4" />
                      <span className="font-medium">
                        {formatInViewerTz(appointment.scheduledAt, "h:mm a")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <AppointmentStatusBadge status={appointment.status} />
                    {modeConfig && (
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${modeConfig.bg} ${modeConfig.color} sm:px-3 sm:py-1.5 sm:text-xs`}>
                        <ModeIcon className="size-3 sm:size-3.5" />
                        {modeConfig.label}
                      </span>
                    )}
                    <Badge variant="outline" className="rounded-full border-slate-200 px-2.5 py-1 text-[10px] font-bold capitalize text-slate-600 sm:px-3 sm:py-1.5 sm:text-xs">
                      {appointment.allocationMode}
                    </Badge>
                  </div>

                  {canOpenSession && (
                    <div className="pt-2">
                      <Button
                        asChild
                        className="h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 font-bold shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700"
                      >
                        <Link to={sessionPath}>
                          <PlayCircle className="mr-2 size-4" />
                          {appointment.status === "in_progress" ? "Rejoin session" : "Start session"}
                        </Link>
                      </Button>
                    </div>
                  )}
                  {!canOpenSession && sessionAccess && !["pending_payment", "cancelled", "no_show"].includes(appointment.status) && (
                    <div className="pt-2">
                      <div className="inline-flex max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                        {sessionAccess.isTooEarly
                          ? `Session access opens at ${formatInViewerTz(appointment.sessionAccessStartsAt, "h:mm a")}`
                          : sessionAccess.isExpired
                            ? "This session window has ended"
                            : appointment.status === "completed"
                              ? "This session has been completed"
                              : "Session is currently unavailable"}
                      </div>
                    </div>
                  )}

                  {user?.role === "patient" && appointment.status === "completed" && !appointment.hasFeedback && (
                    <div className="pt-2">
                      <Button
                        asChild
                        className="h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 font-bold shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-green-700"
                      >
                        <Link to={`/feedback/${appointment.id}`}>
                          <Star className="mr-2 size-4" />
                          Leave feedback
                        </Link>
                      </Button>
                    </div>
                  )}
                  {user?.role === "patient" && appointment.status === "completed" && appointment.hasFeedback && (
                    <div className="pt-2">
                      <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                        <Star className="size-4 fill-current" />
                        Feedback submitted
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Concern Section */}
            {appointment.concernDescription && (
              <Card className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-950 sm:text-lg">
                    <MessageSquare className="size-4 text-primary sm:size-5" />
                    Your concern
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 sm:pt-6">
                  <p className="text-sm leading-relaxed text-slate-600">
                    {appointment.concernDescription}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Feedback Section */}
            {appointment.feedback && (
              <Card className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-950 sm:text-lg">
                    <Star className="size-4 text-primary sm:size-5" />
                    Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 sm:pt-6">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-5 ${i < appointment.feedback!.rating ? "fill-amber-400 text-amber-400" : "text-amber-200"}`}
                      />
                    ))}
                  </div>
                  {appointment.feedback.comment && (
                    <p className="text-sm leading-relaxed text-slate-700">
                      "{appointment.feedback.comment}"
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    Submitted on {formatInViewerTz(appointment.feedback.createdAt, "MMMM d, yyyy")}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Payment Section */}
            {appointment.payment && (
              <Card className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-950 sm:text-lg">
                    <CreditCard className="size-4 text-primary sm:size-5" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-2 text-sm sm:pt-6 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Status</span>
                    <span className="capitalize font-bold text-slate-800">{appointment.payment.status}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Amount</span>
                    <span className="text-base font-black text-slate-950 sm:text-lg">
                      {formatMoney(
                        appointment.payment.amount,
                        appointment.payment.currency
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Payment Banner */}
            {appointment.status === "pending_payment" && user?.role === "patient" && (
              <Card className="overflow-hidden rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 shadow-sm">
                <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:pt-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 grid size-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg sm:size-12">
                      <AlertCircle className="size-5 sm:size-6" />
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-950 sm:text-lg">Complete your booking</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Your appointment is waiting for secure payment confirmation.
                      </p>
                    </div>
                  </div>
                  <RetryPaymentButton
                    appointmentId={appointment.id}
                    onConfirmed={loadAppointment}
                  />
                </CardContent>
              </Card>
            )}

            {/* Cancel Button */}
            {canCancelAppointment(appointment.status) && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="destructive"
                  className="h-10 w-full rounded-xl px-6 font-bold shadow-sm sm:w-auto sm:h-11 sm:px-8"
                  onClick={() => setCancelOpen(true)}
                >
                  Cancel appointment
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {appointment && (
        <CancelAppointmentDialog
          appointmentId={appointment.id}
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          onCancelled={loadAppointment}
        />
      )}
    </div>
  );
};
