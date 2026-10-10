import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RatingStars } from "./RatingStars";
import { submitFeedback } from "../api/feedback.api";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

interface FeedbackFormProps {
  appointmentId: string;
  onSuccess?: () => void;
}

export function FeedbackForm({ appointmentId, onSuccess }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [continueWithSamePsych, setContinueWithSamePsych] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({
        appointmentId,
        rating,
        comment: comment.trim() || undefined,
        continueWithSamePsychologist: continueWithSamePsych || undefined,
      });
      setHasSubmitted(true);
      toast.success("Thank you for your feedback!");
      onSuccess?.();
    } catch (error: unknown) {
      const apiCode =
        error instanceof Object &&
        "response" in error &&
        (error as { response?: { data?: { code?: string } } }).response?.data?.code;

      if (apiCode === "DUPLICATE_FEEDBACK") {
        setHasSubmitted(true);
        toast.info("You have already submitted feedback for this session.");
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
        <CardContent className="pt-6 sm:pt-8">
          <div className="relative text-center py-10 sm:py-16">
            <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-amber-100/50 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 -bottom-10 size-32 rounded-full bg-emerald-100/30 blur-3xl" />
            <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-6 sm:h-20 sm:w-20 sm:mb-8" />
            <h3 className="text-xl font-black tracking-tight text-slate-950 mb-3 sm:text-2xl">
              Feedback Submitted!
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Thank you for sharing your experience!
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-xs font-semibold text-slate-500">Your rating:</span>
              <RatingStars value={rating} readOnly size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white pb-4 sm:pb-6">
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-violet-100/30 blur-2xl" />
        <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-950 sm:text-2xl relative">
          Session Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 sm:pt-8">
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-4">
            <Label className="text-base font-bold text-slate-800">
              How was your session?
            </Label>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <RatingStars value={rating} onChange={setRating} size="lg" />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="comment" className="text-base font-bold text-slate-800">
              Additional comments (optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="rounded-xl border-slate-200 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <Checkbox
              id="continue"
              checked={continueWithSamePsych}
              onCheckedChange={(checked) => setContinueWithSamePsych(!!checked)}
              className="size-5"
            />
            <Label htmlFor="continue" className="cursor-pointer font-medium text-slate-700">
              Would you like to continue sessions with this psychologist?
            </Label>
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-xl bg-gradient-to-r from-primary to-violet-600 px-6 font-bold text-base shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 transition-all sm:h-12"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
