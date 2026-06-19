import { useEffect, useState } from "react";
import { toast } from "sonner";

// Razorpay SDK types — not part of the backend contract, defined here where they're used
interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
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

interface RazorpayCheckoutProps {
  options: Omit<RazorpayOptions, "handler">;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onError: (error: unknown) => void;
}

export const RazorpayCheckout = ({
  options,
  onSuccess,
  onError,
}: RazorpayCheckoutProps) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Avoid injecting the script twice if already present
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => toast.error("Failed to load payment gateway");
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
      handler: (response: RazorpaySuccessResponse) => {
        onSuccess(response);
      },
    });

    rzp.on("payment.failed", (error: unknown) => {
      onError(error);
    });

    rzp.open();
  };

  return { handlePayment, isReady: isScriptLoaded };
};
