import { CheckCircle2, HeartHandshake, ShieldCheck, Stethoscope } from "lucide-react";
import { AuthVisualPanel } from "../components/AuthVisualPanel";
import { RegisterForm } from "../components/RegisterForm";

export const RegisterPage = () => {
  return (
    <div className="relative min-h-screen  px-4 py-5 md:px-7 lg:py-4">
      {/* <div className="pointer-events-none absolute right-[35%] top-24 size-80 animate-pulse rounded-full bg-violet-200/20 blur-3xl" /> */}
      <main className="mx-auto grid items-start gap-0 overflow-y-auto rounded-[2.5rem] lg:grid-cols-[.9fr_1.1fr] lg:gap-6 lg:overflow-visible  ">
        <div className="md:sticky top-5 z-10">
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

        <section className="px-5 py-4 sm:px-9 max-w-2xl mx-auto">
          <div className="mx-auto w-full animate-in fade-in slide-in-from-right-5 duration-700">

            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[.16em] text-primary">
                <ShieldCheck className="size-3.5" /> Join ManoBalamHealthCare
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-[-.04em] text-[#111631] sm:text-5xl">
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
