import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw } from "lucide-react";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { verifyOtp } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "@/stores/userStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ApiErrorResponse, Role } from "@/types/global.types";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

const roleHome: Record<Role, string> = {
  patient: "/home",
  psychologist: "/psychologist/dashboard",
  admin: "/admin/dashboard",
};

export const OtpVerifyForm = () => {
  const navigate = useNavigate();
  const { pendingUserId, otpSentTo, clear } = useAuthStore();
  const setUser = useUserStore((s) => s.setUser);
  const setAccessToken = useUserStore((s) => s.setAccessToken);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no pending session
  useEffect(() => {
    if (!pendingUserId || !otpSentTo) {
      navigate("/register");
    }
  }, [pendingUserId, otpSentTo, navigate]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  if (!pendingUserId || !otpSentTo) return null;

  const otp = digits.join("");

  const focusAt = (index: number) => {
    inputRefs.current[Math.min(Math.max(index, 0), OTP_LENGTH - 1)]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    // Allow paste of full OTP into any box
    if (value.length > 1) {
      const cleaned = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
      const next = [...digits];
      cleaned.split("").forEach((ch, i) => {
        if (index + i < OTP_LENGTH) next[index + i] = ch;
      });
      setDigits(next);
      focusAt(index + cleaned.length - 1);
      return;
    }
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else {
        focusAt(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      focusAt(index - 1);
    } else if (e.key === "ArrowRight") {
      focusAt(index + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < OTP_LENGTH) {
      toast.error("Please enter all 6 digits.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await verifyOtp({ userId: pendingUserId, otp });
      setAccessToken(result.accessToken);
      setUser(result.user);
      clear();
      navigate(roleHome[result.user.role]);
    } catch (error) {
      if (isAxiosError<ApiErrorResponse>(error) && error.response?.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Verification failed.");
      }
      // Clear boxes on failure so the user can retype
      setDigits(Array(OTP_LENGTH).fill(""));
      focusAt(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    // No resend endpoint yet — inform the user
    toast.info("This feature coming soon");
    setCooldown(RESEND_COOLDOWN);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Destination hint */}
      <p className="text-sm text-muted-foreground text-center">
        We sent a 6-digit code to your{" "}
        <span className="font-semibold text-foreground">{otpSentTo}</span>.
        <br />
        Enter it below to verify your account.
      </p>

      {/* OTP digit boxes */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            aria-label={`Digit ${i + 1}`}
            className={cn(
              "w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold",
              "bg-background border border-border rounded-lg",
              "text-foreground caret-primary",
              "transition-all duration-150",
              "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
              digit && "border-primary/60 bg-primary/5"
            )}
          />
        ))}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading || otp.length < OTP_LENGTH}
        className="w-full py-3 h-auto rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-[0px_4px_12px_rgba(99,14,212,0.15)]"
      >
        {isLoading ? "Verifying..." : "Verify & Continue"}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </Button>

      {/* Resend */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Didn't receive the code?{" "}
          {cooldown > 0 ? (
            <span className="font-medium text-muted-foreground/70 inline-flex items-center gap-1">
              <RotateCcw className="h-3 w-3" />
              Resend in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-primary font-semibold hover:underline"
            >
              Resend code
            </button>
          )}
        </p>
      </div>

      {/* Back link */}
      <p className="text-center text-xs text-muted-foreground border-t border-border pt-4">
        Wrong account?{" "}
        <button
          type="button"
          onClick={() => { clear(); navigate("/register"); }}
          className="text-primary font-semibold hover:underline"
        >
          Go back
        </button>
      </p>
    </form>
  );
};
