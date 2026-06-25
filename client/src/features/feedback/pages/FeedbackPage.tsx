import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackForm } from "../components/FeedbackForm";

export function FeedbackPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  if (!appointmentId) return null;

  return (
    <div className="min-h-screen bg-slate-50/60">
      <header className="sticky top-0 z-20">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 md:px-8">
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Back to appointments"
            className="rounded-xl"
          >
            <div onClick={() => navigate(-1)}>
              <ArrowLeft className="size-5" />
            </div>
          </Button>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">
              Session Feedback
            </h1>
            <p className="text-sm text-slate-500">
              Share your experience from the session
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:space-y-6 sm:py-8 md:px-8">
        <FeedbackForm
          appointmentId={appointmentId}
          onSuccess={() => navigate("/appointments")}
        />
      </main>
    </div>
  );
}
