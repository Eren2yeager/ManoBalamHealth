import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircleHeart, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackForm } from "../components/FeedbackForm";

export function FeedbackPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  if (!appointmentId) return null;

  return (
    <div className="min-h-screen bg-slate-50/60">
      <header className="px-4 pt-6 md:px-8 md:pt-8">
        <div className="mx-auto max-w-4xl">
          <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#17142f] px-5 py-7 text-white shadow-[0_24px_70px_-30px_rgba(76,29,149,.65)] sm:px-8">
            <div className="absolute -right-24 -top-24 -z-10 size-80 rounded-full bg-violet-500/25 blur-3xl" />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to appointments"
            className="rounded-xl text-white hover:bg-white/10 hover:text-white"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-5" />
          </Button>
            <div className="mt-5 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-violet-200">
                <Sparkles className="size-3.5" />
                Reflect after care
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Share what the session felt like.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-violet-100/75">
                Your feedback helps improve care quality and can guide whether you continue with the same psychologist.
              </p>
            </div>
          </section>
        </div>
      </header>
      <main className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:space-y-6 sm:py-8 md:px-8">
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="flex gap-3 rounded-3xl border border-violet-100 bg-white p-4 shadow-sm">
            <MessageCircleHeart className="mt-0.5 size-5 shrink-0 text-violet-700" />
            <div>
              <p className="font-black text-slate-950">Honest is enough</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">You can leave a rating only, or add a short note.</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-3xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" />
            <div>
              <p className="font-black text-emerald-950">Used for care quality</p>
              <p className="mt-1 text-xs leading-5 text-emerald-800/75">Feedback supports quality and continuity decisions.</p>
            </div>
          </div>
        </section>
        <FeedbackForm
          appointmentId={appointmentId}
          onSuccess={() => navigate("/appointments")}
        />
      </main>
    </div>
  );
}
