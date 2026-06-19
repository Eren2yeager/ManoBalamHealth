import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackForm } from "../components/FeedbackForm";

export function FeedbackPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  if (!appointmentId) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-xl font-semibold">Session Feedback</h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <FeedbackForm
          appointmentId={appointmentId}
          onSuccess={() => navigate("/appointments")}
        />
      </main>
    </div>
  );
}
