import { ShieldCheck } from "lucide-react";
import { RegisterForm } from "../components/RegisterForm";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center py-10 px-4 md:px-8">
        <div className="w-full max-w-4xl flex flex-col md:flex-row bg-card rounded-2xl border border-border shadow-[0px_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">

          {/* Left: Branding panel */}
          <div className="hidden md:flex w-5/12 bg-secondary/30 p-10 flex-col justify-between relative overflow-hidden">
            {/* Gradient backdrop */}
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-secondary/20 to-background/80 pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-8 h-full">
              {/* Top: Brand + headline */}
              <div className="flex flex-col gap-4">
                <BrandLogo />
                <div>
                  <h2 className="text-3xl font-bold leading-tight text-foreground font-[Manrope,sans-serif]">
                    Begin Your Journey
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Create a ManoBalam account to access mental-health support
                    and connect with licensed professionals.
                  </p>
                </div>
              </div>

              {/* Bottom: Trust badge */}
              <div className="mt-auto bg-background/70 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Secure &amp; Confidential</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Your account is protected through role-based access and secure authentication.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="w-full md:w-7/12 p-6 md:p-10 flex flex-col">
            {/* Mobile brand mark */}
            <BrandLogo className="mb-6 md:hidden" />

            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight font-[Manrope,sans-serif]">
                Create an Account
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                Join our serene clinical community.
              </p>
            </div>

            <RegisterForm />
          </div>
        </div>
      </main>


    </div>
  );
};
