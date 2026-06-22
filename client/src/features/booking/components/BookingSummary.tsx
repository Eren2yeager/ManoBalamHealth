import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CreditCard,
  HeartHandshake,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookingStore } from "../store/bookingStore";
import { createAppointment } from "../api/booking.api";
import { getBookingErrorMessage } from "../utils/bookingErrors";
import { createOrder, verifyPayment } from "@/features/payment/api/payment.api";
import { useRazorpayCheckout } from "@/features/payment/components/RazorpayCheckout";
import { getPsychologistById } from "@/features/psychologists/api/psychologist.api";
import { formatInViewerTz } from "@/lib/timezone";
import { useUserStore } from "@/stores/userStore";
import type { CreateOrderResponse } from "@/features/payment/types/payment.types";
import type { PsychologistDetail } from "@/features/psychologists/types/psychologist.types";
import { SPECIALIZATION_LABEL } from "@/features/psychologists/constants/psychologist.constants";
import type { Specialization } from "@/features/psychologists/constants/psychologist.constants";
import type { Money } from "@/types/global.types";

interface PaymentCheckoutState {
  appointmentId: string;
  order: CreateOrderResponse;
  fee: Money;
}

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount / 100);

interface BookingSummaryProps {
  onBack?: () => void;
}

export const BookingSummary = ({ onBack }: BookingSummaryProps) => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { openPayment, isReady } = useRazorpayCheckout();
  const {
    allocationMode,
    mode,
    concernDescription,
    selectedPsychologistId,
    selectedSlotId,
    preferredWindow,
    specialization,
    scheduledAt,
    assignedPsychologistId,
    assignedFee,
    setAssignmentResult,
    reset,
  } = useBookingStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [paymentCheckout, setPaymentCheckout] =
    useState<PaymentCheckoutState | null>(null);
  const [psychologistState, setPsychologistState] = useState<{
    id: string | null;
    data: PsychologistDetail | null;
  }>({ id: null, data: null });

  const resolvedPsychologistId =
    assignedPsychologistId ?? selectedPsychologistId;
  const assignedPsychologist =
    psychologistState.id === resolvedPsychologistId
      ? psychologistState.data
      : null;
  const isLoadingPsychologist =
    Boolean(resolvedPsychologistId) &&
    psychologistState.id !== resolvedPsychologistId;

  useEffect(() => {
    if (!resolvedPsychologistId) return;
    let active = true;
    void getPsychologistById(resolvedPsychologistId)
      .then((psychologist) => {
        if (active) {
          setPsychologistState({ id: resolvedPsychologistId, data: psychologist });
        }
      })
      .catch(() => {
        if (active) {
          setPsychologistState({ id: resolvedPsychologistId, data: null });
        }
      });
    return () => {
      active = false;
    };
  }, [resolvedPsychologistId]);

  const launchPayment = (checkout: PaymentCheckoutState) => {
    const opened = openPayment({
      options: {
        key: checkout.order.razorpayKeyId,
        amount: checkout.order.amount,
        currency: checkout.order.currency,
        name: "ManoBalamHealthCare",
        description: "Confidential mental-health consultation",
        order_id: checkout.order.razorpayOrderId,
        prefill: {
          name: user?.name ?? "",
          email: user?.email ?? "",
          contact: "",
        },
        notes: { appointment_id: checkout.appointmentId },
        theme: { color: "#7c3aed" },
      },
      onSuccess: async (response) => {
        setIsProcessing(true);
        try {
          await verifyPayment({
            appointmentId: checkout.appointmentId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });
          toast.success("Payment verified. Your session is confirmed.");
          reset();
          navigate(`/appointments/${checkout.appointmentId}`);
        } catch {
          toast.error(
            "Payment verification is still pending. You can safely retry from the appointment page.",
          );
          navigate(`/appointments/${checkout.appointmentId}`);
        } finally {
          setIsProcessing(false);
        }
      },
      onError: () => {
        toast.error("Payment failed. Your booking remains available for retry.");
        setIsProcessing(false);
      },
      onDismiss: () => {
        toast.info("Payment window closed. You can retry when you are ready.");
        setIsProcessing(false);
      },
    });

    if (!opened) setIsProcessing(false);
  };

  const handleConfirm = async () => {
    if (paymentCheckout) {
      setIsProcessing(true);
      launchPayment(paymentCheckout);
      return;
    }

    if (!mode || !allocationMode) {
      toast.error("Please complete all booking steps.");
      return;
    }

    setBookingError(null);
    setIsProcessing(true);

    try {
      const appointment =
        allocationMode === "manual"
          ? await createAppointment({
              allocationMode: "manual",
              slotId: selectedSlotId!,
              mode,
              concernDescription: concernDescription || undefined,
            })
          : await createAppointment({
              allocationMode: "auto",
              preferredFrom: preferredWindow!.from,
              preferredTo: preferredWindow!.to,
              mode,
              specialization: specialization ?? undefined,
              concernDescription: concernDescription || undefined,
            });

      setAssignmentResult({
        psychologistId: appointment.psychologistId,
        scheduledAt: appointment.scheduledAt,
        fee: appointment.fee,
      });

      const order = await createOrder(appointment.appointmentId);
      const checkout = {
        appointmentId: appointment.appointmentId,
        order,
        fee: appointment.fee,
      };
      setPaymentCheckout(checkout);
      launchPayment(checkout);
    } catch (error) {
      setBookingError(getBookingErrorMessage(error));
      setIsProcessing(false);
      if (!(error instanceof AxiosError)) {
        toast.error("Failed to create booking. Please try again.");
      }
    }
  };

  const displayFee =
    paymentCheckout?.fee ??
    assignedFee ??
    assignedPsychologist?.consultationFee ??
    null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">
          Final review
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Everything look right?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Review your session details before opening secure payment.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm">
        <div className="flex items-center gap-4 bg-gradient-to-r from-violet-50 to-blue-50/60 p-5">
          <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white text-violet-700 shadow-sm">
            {assignedPsychologist?.avatarUrl ? (
              <img
                src={assignedPsychologist.avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <UserRound className="size-5" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-violet-600">
              {assignedPsychologistId ? "Your matched psychologist" : "Your psychologist"}
            </p>
            {isLoadingPsychologist ? (
              <Skeleton className="mt-2 h-5 w-44" />
            ) : (
              <p className="mt-1 truncate text-lg font-black text-slate-950">
                {assignedPsychologist?.name ?? "Assigned after confirmation"}
              </p>
            )}
          </div>
          <Badge className="ml-auto hidden rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100 sm:inline-flex">
            <BadgeCheck className="mr-1 size-3.5" />
            Verified
          </Badge>
        </div>

        <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
          <SummaryItem
            icon={HeartHandshake}
            label="Booking path"
            value={allocationMode === "auto" ? "Automatic match" : "Chosen professional"}
          />
          <SummaryItem
            icon={MessageSquareText}
            label="Session type"
            value={mode ? `${mode[0].toUpperCase()}${mode.slice(1)}` : "—"}
          />
          {preferredWindow && (
            <SummaryItem
              icon={CalendarDays}
              label="Preferred window"
              value={`${formatInViewerTz(preferredWindow.from, "MMM d · h:mm a")} – ${formatInViewerTz(preferredWindow.to, "h:mm a")}`}
            />
          )}
          {scheduledAt && (
            <SummaryItem
              icon={CalendarDays}
              label="Scheduled time"
              value={formatInViewerTz(scheduledAt, "MMM d · h:mm a")}
            />
          )}
          {allocationMode === "auto" && (
            <SummaryItem
              icon={Stethoscope}
              label="Specialization"
              value={
                specialization
                  ? SPECIALIZATION_LABEL[specialization as Specialization]
                  : "Any suitable professional"
              }
            />
          )}
          {displayFee && (
            <SummaryItem
              icon={CreditCard}
              label="Session fee"
              value={formatMoney(displayFee.amount, displayFee.currency)}
            />
          )}
        </div>

        {concernDescription && (
          <div className="border-t border-slate-100 p-5">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
              What you shared
            </p>
            <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {concernDescription}
            </p>
          </div>
        )}
      </div>

      {bookingError && (
        <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-sm font-bold">{bookingError}</p>
            {allocationMode === "auto" && onBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="mt-3 rounded-xl border-rose-200 bg-white"
              >
                Adjust time window
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <p className="flex items-center gap-2 text-sm font-black text-emerald-800">
          <ShieldCheck className="size-4" />
          Protected checkout
        </p>
        <p className="mt-1 text-xs leading-5 text-emerald-700/80">
          Payment is confirmed only after secure server-side signature verification.
          Closing the payment window will not charge you.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        {onBack && !paymentCheckout && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-12 rounded-xl px-5 font-bold"
          >
            <ArrowLeft className="mr-2 size-4" />
            Edit details
          </Button>
        )}
        <Button
          className="h-12 flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-black shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700"
          onClick={handleConfirm}
          disabled={isProcessing || !isReady}
        >
          <LockKeyhole className="mr-2 size-4" />
          {isProcessing
            ? "Preparing secure checkout..."
            : paymentCheckout
              ? "Retry secure payment"
              : "Proceed to secure payment"}
        </Button>
      </div>

      {paymentCheckout && (
        <p className="text-center text-xs text-slate-500">
          Your appointment has been created. You can also{" "}
          <Link
            to={`/appointments/${paymentCheckout.appointmentId}`}
            className="font-bold text-violet-700 hover:underline"
          >
            retry later from its appointment page
          </Link>
          .
        </p>
      )}
    </div>
  );
};

function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof HeartHandshake;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 bg-white p-5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-xs font-bold text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}
