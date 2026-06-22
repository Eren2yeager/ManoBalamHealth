import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookingStore } from "../store/bookingStore";
import { createAppointment } from "../api/booking.api";
import { getBookingErrorMessage } from "../utils/bookingErrors";
import { createOrder, verifyPayment } from "@/features/payment/api/payment.api";
import { RazorpayCheckout } from "@/features/payment/components/RazorpayCheckout";
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

// const SPECIALIZATIONS: Record<Specialization, string> = {
//   anxiety: "Anxiety",
//   depression: "Depression",
//   relationships: "Relationships",
//   stress: "Stress",
//   trauma: "Trauma",
//   grief: "Grief",
//   "self-esteem": "Self-esteem",
//   sleep: "Sleep",
//   "work-life-balance": "Work-life balance",
//   other: "Other",
// };

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount / 100);

interface BookingSummaryProps {
  onBack?: () => void;
}

export const BookingSummary = ({ onBack }: BookingSummaryProps) => {
  const navigate = useNavigate();
  const { user } = useUserStore();
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
  const [paymentCheckout, setPaymentCheckout] = useState<PaymentCheckoutState | null>(null);
  const [shouldOpenPayment, setShouldOpenPayment] = useState(false);
  const [assignedPsychologist, setAssignedPsychologist] = useState<PsychologistDetail | null>(null);
  const [isLoadingPsychologist, setIsLoadingPsychologist] = useState(false);

  const resolvedPsychologistId = assignedPsychologistId ?? selectedPsychologistId;

  useEffect(() => {
    if (!resolvedPsychologistId) {
      setAssignedPsychologist(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setIsLoadingPsychologist(true);
      try {
        const psychologist = await getPsychologistById(resolvedPsychologistId);
        if (!cancelled) setAssignedPsychologist(psychologist);
      } catch {
        // Non-critical — we still show the rest of the summary
      } finally {
        if (!cancelled) setIsLoadingPsychologist(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [resolvedPsychologistId]);

  const { handlePayment, isReady } = RazorpayCheckout({
    options: paymentCheckout
      ? {
          key: paymentCheckout.order.razorpayKeyId,
          amount: paymentCheckout.order.amount,
          currency: paymentCheckout.order.currency,
          name: "ManoBalam",
          description: "Therapy Session",
          order_id: paymentCheckout.order.razorpayOrderId,
          prefill: {
            name: user?.name ?? "",
            email: user?.email ?? "",
            contact: "",
          },
          notes: { appointment_id: paymentCheckout.appointmentId },
          theme: { color: "#9333ea" },
        }
      : {
          key: "",
          amount: 0,
          currency: "INR",
          name: "",
          description: "",
          order_id: "",
          prefill: { name: "", email: "", contact: "" },
          notes: { appointment_id: "" },
          theme: { color: "" },
        },
    onSuccess: async (response) => {
      if (!paymentCheckout) return;
      setIsProcessing(true);
      try {
        await verifyPayment({
          appointmentId: paymentCheckout.appointmentId,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        });
        toast.success("Payment successful! Booking confirmed.");
        reset();
        navigate("/appointments");
      } catch {
        toast.error("Payment verification failed. You can retry from your appointments.");
      } finally {
        setIsProcessing(false);
      }
    },
    onError: () => {
      toast.error("Payment failed or cancelled. You can try again.");
      setIsProcessing(false);
    },
  });

  useEffect(() => {
    if (!shouldOpenPayment || !paymentCheckout || !isReady) return;
    handlePayment();
    setShouldOpenPayment(false);
  }, [shouldOpenPayment, paymentCheckout, isReady, handlePayment]);

  const handleConfirm = async () => {
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
      setPaymentCheckout({
        appointmentId: appointment.appointmentId,
        order,
        fee: appointment.fee,
      });

      setShouldOpenPayment(true);
    } catch (error) {
      setBookingError(getBookingErrorMessage(error));
      if (!(error instanceof AxiosError)) {
        toast.error("Failed to create booking. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Display fee: from assignment result, or from the fetched psychologist's consultationFee
  const displayFee = assignedFee ?? assignedPsychologist?.consultationFee ?? null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Booking mode</span>
            <Badge variant="secondary" className="capitalize">
              {allocationMode === "auto" ? "Automatic match" : "Manual selection"}
            </Badge>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Consultation type</span>
            <Badge className="capitalize">{mode}</Badge>
          </div>

          {allocationMode === "auto" && preferredWindow && (
            <>
              <div className="space-y-1">
                <div className="text-muted-foreground">Preferred window</div>
                <div className="text-sm">
                  {formatInViewerTz(preferredWindow.from, "EEEE, MMMM d · h:mm a")} –{" "}
                  {formatInViewerTz(preferredWindow.to, "h:mm a")}
                </div>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Specialization</span>
                <span className="text-sm">
                  {specialization
                    ? SPECIALIZATION_LABEL[specialization as Specialization]
                    : "Any"}
                </span>
              </div>
            </>
          )}

          {(assignedPsychologistId || selectedPsychologistId) && (
            <div className="space-y-1">
              <div className="text-muted-foreground">
                {assignedPsychologistId ? "Matched psychologist" : "Psychologist"}
              </div>
              {isLoadingPsychologist ? (
                <Skeleton className="h-5 w-40" />
              ) : (
                <div className="text-sm font-medium">
                  {assignedPsychologist?.name ?? "—"}
                </div>
              )}
            </div>
          )}

          {scheduledAt && (
            <div className="space-y-1">
              <div className="text-muted-foreground">Scheduled time</div>
              <div className="text-sm">
                {formatInViewerTz(scheduledAt, "EEEE, MMMM d · h:mm a")}
              </div>
            </div>
          )}

          {displayFee && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Session fee</span>
              <span className="font-medium">
                {formatMoney(displayFee.amount, displayFee.currency)}
              </span>
            </div>
          )}

          {concernDescription && (
            <div className="space-y-2">
              <div className="text-muted-foreground">Concern description</div>
              <div className="bg-muted p-3 rounded-md text-sm">{concernDescription}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {bookingError && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-3">
                <p className="text-sm text-foreground">{bookingError}</p>
                {allocationMode === "auto" && onBack && (
                  <Button variant="outline" size="sm" onClick={onBack}>
                    Adjust time window
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        className="w-full rounded-full"
        size="lg"
        onClick={handleConfirm}
        disabled={isProcessing || !isReady}
      >
        {isProcessing ? "Processing..." : "Proceed to Payment"}
      </Button>
    </div>
  );
};
