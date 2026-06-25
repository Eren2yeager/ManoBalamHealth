import { useState } from "react";
import { CreditCard, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";
import { createOrder, verifyPayment } from "../api/payment.api";
import { useRazorpayCheckout } from "./RazorpayCheckout";

interface RetryPaymentButtonProps {
  appointmentId: string;
  onConfirmed: () => void | Promise<void>;
}

export function RetryPaymentButton({
  appointmentId,
  onConfirmed,
}: RetryPaymentButtonProps) {
  const user = useUserStore((state) => state.user);
  const { openPayment, isReady } = useRazorpayCheckout();
  const [loading, setLoading] = useState(false);

  const retryPayment = async () => {
    setLoading(true);
    try {
      const order = await createOrder(appointmentId);
      const opened = openPayment({
        options: {
          key: order.razorpayKeyId,
          amount: order.amount,
          currency: order.currency,
          name: "ManoBalamHealthCare",
          description: "Confidential mental-health consultation",
          order_id: order.razorpayOrderId,
          prefill: {
            name: user?.name ?? "",
            email: user?.email ?? "",
            contact: "",
          },
          notes: { appointment_id: appointmentId },
          theme: { color: "#7c3aed" },
        },
        onSuccess: async (response) => {
          try {
            await verifyPayment({
              appointmentId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment verified. Your appointment is confirmed.");
            await onConfirmed();
          } catch {
            toast.error(
              "We could not verify the payment yet. Please refresh before retrying.",
            );
          } finally {
            setLoading(false);
          }
        },
        onError: () => {
          toast.error("Payment failed. Please try again when you are ready.");
          setLoading(false);
        },
        onDismiss: () => {
          toast.info("Payment window closed without a charge.");
          setLoading(false);
        },
      });

      if (!opened) setLoading(false);
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Unable to prepare payment. The slot may no longer be available.";
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={retryPayment}
      disabled={loading || !isReady}
      className="h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 font-bold"
    >
      {loading ? (
        <LoaderCircle className="mr-2 size-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 size-4" />
      )}
      Retry secure payment
    </Button>
  );
}
