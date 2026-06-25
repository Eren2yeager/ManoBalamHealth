import { ArrowLeft, HeartHandshake, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthVisualPanel } from "../components/AuthVisualPanel";
import { LoginForm } from "../components/LoginForm";

export const LoginPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_10%,rgba(196,181,253,.35),transparent_28%),radial-gradient(circle_at_90%_85%,rgba(191,219,254,.3),transparent_26%),#fbfaff] px-4 py-5 md:px-7 lg:py-7">
      <div className="pointer-events-none absolute left-[45%] top-10 size-72 animate-pulse rounded-full bg-violet-200/20 blur-3xl" />
      <Link to="/" className="absolute left-5 top-5 z-20 hidden items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-4 py-2 text-xs font-bold text-slate-600 shadow-sm backdrop-blur transition hover:text-primary md:flex lg:hidden">
        <ArrowLeft className="size-4" /> Home
      </Link>

      <main className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-[1380px] items-stretch gap-0 overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/80 shadow-[0_35px_100px_rgba(67,44,119,.13)] backdrop-blur-xl lg:grid-cols-[1.08fr_.92fr] lg:gap-6 lg:bg-transparent lg:shadow-none">
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

        <section className="flex items-center justify-center px-5 py-9 sm:px-10 lg:rounded-[2.25rem] lg:bg-white lg:px-12 lg:shadow-[0_25px_80px_rgba(52,35,98,.1)] xl:px-16">
          <div className="w-full max-w-[460px] animate-in fade-in slide-in-from-right-5 duration-700">
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
