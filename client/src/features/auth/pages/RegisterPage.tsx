import { CheckCircle2, HeartHandshake, ShieldCheck, Stethoscope } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthVisualPanel } from "../components/AuthVisualPanel";
import { RegisterForm } from "../components/RegisterForm";

export const RegisterPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_8%,rgba(221,214,254,.55),transparent_27%),radial-gradient(circle_at_95%_55%,rgba(219,234,254,.45),transparent_30%),#fbfaff] px-4 py-5 md:px-7 lg:py-7">
      <div className="pointer-events-none absolute right-[35%] top-24 size-80 animate-pulse rounded-full bg-violet-200/20 blur-3xl" />
      <main className="mx-auto grid max-w-[1420px] items-start gap-0 overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/85 shadow-[0_35px_100px_rgba(67,44,119,.13)] backdrop-blur-xl lg:grid-cols-[.9fr_1.1fr] lg:gap-6 lg:overflow-visible lg:border-0 lg:bg-transparent lg:shadow-none">
        <div className="lg:sticky lg:top-7">
          <AuthVisualPanel
            image="/images/auth-register-journey.png"
            eyebrow="A new beginning"
            title="Take the first step toward feeling more supported."
            description="Create one secure account for professional care, guided self-reflection, and flexible online sessions."
            points={[
              { icon: CheckCircle2, label: "Simple onboarding" },
              { icon: HeartHandshake, label: "Care at your pace" },
              { icon: Stethoscope, label: "Professional pathway" },
            ]}
          />
        </div>

        <section className="px-5 py-8 sm:px-9 lg:rounded-[2.25rem] lg:bg-white lg:px-12 lg:py-11 lg:shadow-[0_25px_80px_rgba(52,35,98,.1)] xl:px-16">
          <div className="mx-auto w-full max-w-[620px] animate-in fade-in slide-in-from-right-5 duration-700">
            <div className="mb-7 lg:hidden"><BrandLogo className="mx-auto" /></div>
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[.16em] text-primary">
                <ShieldCheck className="size-3.5" /> Join ManoBalam
              </span>
              <h1 className="mt-4 text-4xl font-black tracking-[-.04em] text-[#111631] sm:text-5xl">
                Create your account
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Choose your role and we will guide you through the right onboarding path.
              </p>
            </div>
            <div className="mt-8">
              <RegisterForm />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
