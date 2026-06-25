import { HeartHandshake, LockKeyhole, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthVisualPanel } from "../components/AuthVisualPanel";
import { LoginForm } from "../components/LoginForm";

export const LoginPage = () => {
  return (
    <div className="relative min-h-screen  px-4 py-5 md:px-7 lg:py-6">
     

      <main className="mx-auto grid min-h-[calc(100vh-2.5rem items-stretch gap-0 overflow-hidden rounded-[2.5rem]   lg:grid-cols-[1.08fr_.92fr] lg:gap-6 lg:bg-transparent lg:shadow-none">
        <AuthVisualPanel
          image="/images/auth-login-wellness.png"
          eyebrow="Welcome back"
          title="Your safe space is ready when you are."
          description="Return to appointments, assessments, professional support, and the next step in your wellbeing journey."
          points={[
            { icon: ShieldCheck, label: "Verified care" },
            { icon: LockKeyhole, label: "Private access" },
            { icon: HeartHandshake, label: "Human support" },
          ]}
        />

        <section className="flex items-center justify-center px-5 py-9 sm:px-10 lg:rounded-[2.25rem]  ">
          <div className="w-full max-w-100 animate-in fade-in slide-in-from-right-5 duration-700">
            <div className="mb-8 lg:hidden"><BrandLogo className="mx-auto" /></div>
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[.16em] text-primary">
                <ShieldCheck className="size-3.5" /> Secure sign in
              </span>
              <h1 className="mt-4 text-4xl font-black tracking-[-.04em] text-[#111631] sm:text-5xl">
                Welcome back
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Sign in to continue your ManoBalamHealthCare journey.
              </p>
            </div>
            <div className="mt-8">
              <LoginForm />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
