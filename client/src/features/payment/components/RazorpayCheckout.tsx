import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { RazorpayOptions, RazorpaySuccessResponse } from "../types/payment.types";

interface RazorpayCheckoutProps {
  options: Omit<RazorpayOptions, "handler">;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onError: (error: any) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (data: any) => void) => void;
    };
  }
}

export const RazorpayCheckout = ({
  options,
  onSuccess,
  onError,
}: RazorpayCheckoutProps) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      toast.error("Failed to load payment gateway");
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    if (!window.Razorpay || !isScriptLoaded) {
      toast.error("Payment gateway not available");
      return;
    }

    const rzp = new window.Razorpay({
      ...options,
      handler: (response) => {
        onSuccess(response);
      },
    });
    rzp.on("payment.failed", (error: any) => {
      onError(error);
    });
    rzp.open();
  };

  return { handlePayment, isReady: isScriptLoaded };
};
