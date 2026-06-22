import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  handler: (response: RazorpaySuccessResponse) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (data: unknown) => void) => void;
    };
  }
}

type OpenPaymentArgs = {
  options: Omit<RazorpayOptions, "handler">;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onError: (error: unknown) => void;
  onDismiss?: () => void;
};

export const useRazorpayCheckout = () => {
  const [isReady, setIsReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.Razorpay),
  );

  useEffect(() => {
    if (window.Razorpay) return;

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      const handleLoad = () => setIsReady(true);
      existing.addEventListener("load", handleLoad);
      return () => existing.removeEventListener("load", handleLoad);
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsReady(true);
    script.onerror = () => toast.error("Failed to load the secure payment gateway.");
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  const openPayment = useCallback(
    ({ options, onSuccess, onError, onDismiss }: OpenPaymentArgs) => {
      if (!window.Razorpay || !isReady) {
        toast.error("Payment gateway is still loading. Please try again.");
        return false;
      }

      const checkout = new window.Razorpay({
        ...options,
        handler: onSuccess,
        modal: { ondismiss: onDismiss },
      });
      checkout.on("payment.failed", onError);
      checkout.open();
      return true;
    },
    [isReady],
  );

  return { openPayment, isReady };
};
