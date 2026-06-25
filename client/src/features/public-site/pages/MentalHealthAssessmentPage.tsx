import { ArrowRight, BrainCircuit, CheckCircle2, ClipboardCheck, LockKeyhole, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { PublicFooter } from "../components/PublicFooter";
import { PublicPageHero } from "../components/PublicPageHero";

export function MentalHealthAssessmentPage() {
  const { user } = useAuth();
  const destination = user ? "/assessment" : "/login?redirect=%2Fassessment";
  const steps = [
    { icon: ClipboardCheck, title: "Choose a check-in", text: "Select an available questionnaire based on what you want to reflect on." },
    { icon: LockKeyhole, title: "Answer privately", text: "Complete each question honestly in your secure account." },
    { icon: BrainCircuit, title: "Review guidance", text: "See an informational summary and consider useful next steps." },
  ];

  return (
    <div className="min-h-screen bg-[#fcfbff]">
      <PublicPageHero eyebrow="Mental Health Questionnaire" title="A thoughtful first check-in with yourself" summary="MHQ assessments can help you notice patterns in mood, anxiety, or stress and decide whether professional support may be useful." icon={ClipboardCheck} section="MHQ" highlights={["Private account", "Guided questions", "Informational results"]} />
      <main className="px-4 py-14 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="rounded-3xl border border-violet-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <span className="grid size-13 place-items-center rounded-2xl bg-violet-50 text-primary"><Icon className="size-6" /></span>
                <p className="mt-5 text-xs font-black uppercase tracking-wider text-violet-500">Step {index + 1}</p>
                <h2 className="mt-2 text-lg font-black text-[#111631]">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
          <section className="mt-8 grid gap-6 rounded-3xl border border-amber-100 bg-amber-50/70 p-7 md:grid-cols-[auto_1fr] md:p-9">
            <span className="grid size-14 place-items-center rounded-2xl bg-white text-amber-600 shadow-sm"><ShieldAlert className="size-7" /></span>
            <div>
              <h2 className="text-xl font-black text-slate-900">An assessment is not a diagnosis</h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">Results are educational and should not replace a consultation with a qualified professional. If you feel unsafe or are in immediate danger, contact emergency services rather than waiting for an assessment result.</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {["Use results as a conversation starter", "Answer based on your recent experience", "Seek professional help for persistent concerns", "Call 112 in India for immediate danger"].map((item) => (
                  <p key={item} className="flex gap-2 text-sm font-semibold text-slate-700"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />{item}</p>
                ))}
              </div>
            </div>
          </section>
          <section className="mt-8 flex flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-primary to-blue-600 p-8 text-center text-white shadow-xl shadow-violet-200 sm:flex-row sm:text-left">
            <div><h2 className="text-2xl font-black">Ready for your guided check-in?</h2><p className="mt-2 text-sm text-white/80">{user ? "Open your assessment dashboard to continue." : "Log in securely to begin and keep your result history."}</p></div>
            <Button asChild className="h-12 rounded-xl bg-white px-7 font-bold text-primary hover:bg-violet-50"><Link to={destination}>Start assessment <ArrowRight className="ml-1 size-4" /></Link></Button>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

