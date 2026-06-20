import { MailCheck, Smartphone } from "lucide-react";
import { OtpVerifyForm } from "../components/OtpVerifyForm";
import { useAuthStore } from "../store/authStore";

export const VerifyOtpPage = () => {
  const otpSentTo = useAuthStore((s) => s.otpSentTo);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-muted blur-3xl" />
      </div>

      {/* Card */}
      <div className="w-full max-w-[440px] bg-card/95 backdrop-blur-[10px] border border-border rounded-xl shadow-[0px_4px_24px_rgba(99,14,212,0.05)] p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-muted flex items-center justify-center rounded-full">
            {otpSentTo === "phone" ? (
              <Smartphone className="h-6 w-6 text-primary" />
            ) : (
              <MailCheck className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <h1 className="font-[Manrope,sans-serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
              Check your {otpSentTo === "phone" ? "phone" : "inbox"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Verify your identity to activate your account.
            </p>
          </div>
        </div>

        {/* Form */}
        <OtpVerifyForm />
      </div>
    </div>
  );
};
