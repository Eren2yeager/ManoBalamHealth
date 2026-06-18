import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, MessageSquare, Phone, User, Video } from "lucide-react";
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

const MODE_CONFIG: Record<
  ConsultationMode,
  { label: string; icon: typeof MessageSquare }
> = {
  chat: { label: "Chat", icon: MessageSquare },
  audio: { label: "Audio", icon: Phone },
  video: { label: "Video", icon: Video },
};

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount / 100);

const DetailSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="size-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <Skeleton className="h-40 w-full rounded-xl" />
    <Skeleton className="h-32 w-full rounded-xl" />
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
    loadAppointment();
  }, [loadAppointment]);

  if (!id) {
    return null;
  }

  const otherParty =
    user?.role === "psychologist" ? appointment?.patient : appointment?.psychologist;

  const modeConfig = appointment ? MODE_CONFIG[appointment.mode] : null;
  const ModeIcon = modeConfig?.icon ?? MessageSquare;

  const initials =
    otherParty?.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" asChild aria-label="Back to appointments">
            <Link to="/appointments">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Appointment Details</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        {isLoading || !appointment ? (
          <DetailSkeleton />
        ) : (
          <>
            <section className="flex items-start gap-4">
              <Avatar size="lg" className="size-16">
                {otherParty?.avatarUrl ? (
                  <AvatarImage src={otherParty.avatarUrl} alt={otherParty.name} />
                ) : null}
                <AvatarFallback>
                  {initials || <User className="size-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-2">
                <h2 className="text-2xl font-bold text-foreground">{otherParty?.name}</h2>
                <p className="text-muted-foreground">
                  {formatInViewerTz(appointment.scheduledAt)}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <AppointmentStatusBadge status={appointment.status} />
                  <Badge variant="secondary" className="gap-1 capitalize">
                    <ModeIcon className="size-3" />
                    {modeConfig?.label}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {appointment.allocationMode}
                  </Badge>
                </div>
              </div>
            </section>

            {appointment.concernDescription && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your concern</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {appointment.concernDescription}
                  </p>
                </CardContent>
              </Card>
            )}

            {appointment.payment && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="capitalize font-medium">{appointment.payment.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">
                      {formatMoney(
                        appointment.payment.amount,
                        appointment.payment.currency
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {canCancelAppointment(appointment.status) && (
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => setCancelOpen(true)}
              >
                Cancel appointment
              </Button>
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
