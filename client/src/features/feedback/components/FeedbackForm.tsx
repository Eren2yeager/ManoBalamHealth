import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Feedback Submitted</h3>
            <p className="text-muted-foreground mb-4">
              Thank you for sharing your experience!
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Your rating:</span>
              <RatingStars value={rating} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Session Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>How was your session?</Label>
            <RatingStars value={rating} onChange={setRating} size="lg" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Additional comments (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="continue"
              checked={continueWithSamePsych}
              onChange={(e) => setContinueWithSamePsych(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-primary"
            />
            <Label htmlFor="continue" className="cursor-pointer font-normal">
              Would you like to continue sessions with this psychologist?
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
