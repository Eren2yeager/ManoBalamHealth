import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AssessmentQuestion } from "../components/AssessmentQuestion";
import { AssessmentProgress } from "../components/AssessmentProgress";
import { AssessmentResult } from "../components/AssessmentResult";
import { getAssessmentTemplate, submitAssessment } from "../api/assessment.api";
import { useAssessmentStore } from "../store/assessmentStore";
import { Loader2 } from "lucide-react";
import type { AssessmentType } from "../types/assessment.types";

export function AssessmentPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const {
    currentStep,
    answers,
    template,
    result,
    isLoading,
    error,
    setTemplate,
    setAnswer,
    setResult,
    setCurrentStep,
    setIsLoading,
    setError,
    reset,
  } = useAssessmentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // On the /assessment/:type/result route the store already has the result —
  // just render it. Only load the template when we're on the question route.
  const isResultRoute = window.location.pathname.endsWith("/result");

  useEffect(() => {
    // If we landed on the result route but the store has no result
    // (e.g. direct URL visit or page reload), redirect back to the hub.
    if (isResultRoute && !result) {
      navigate("/assessment", { replace: true });
      return;
    }

    if (isResultRoute || !type) return;

    const loadTemplate = async () => {
      try {
        setIsLoading(true);
        const data = await getAssessmentTemplate(type as AssessmentType);
        setTemplate(data);
      } catch {
        setError("Failed to load assessment");
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();

    return () => {
      // Only reset when leaving the question flow, not when navigating to /result
      if (!window.location.pathname.endsWith("/result")) {
        reset();
      }
    };
  }, [type, isResultRoute]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    if (!template) return;
    if (currentStep < template.questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!template) return;
    setIsSubmitting(true);
    try {
      const payload = {
        templateId: template.templateId,
        answers: Object.entries(answers).map(([questionId, selectedScore]) => ({
          questionId,
          selectedScore,
        })),
      };
      const assessmentResult = await submitAssessment(payload);
      setResult(assessmentResult);
      // Navigate to the result route — store holds the result, component reads it there
      navigate(`/assessment/${type}/result`);
    } catch {
      setError("Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Result view (rendered at /assessment/:type/result) ────────────────────
  if (isResultRoute && result) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-3xl mx-auto px-4">
          <AssessmentResult result={result} />
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => {
                reset();
                navigate("/assessment");
              }}
            >
              Take Another Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading / error states ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate("/assessment")}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!template) return null;

  // ── Question flow ─────────────────────────────────────────────────────────
  const currentQuestion = template.questions[currentStep];
  const selectedScore = answers[currentQuestion.id] ?? null;
  const isLastStep = currentStep === template.questions.length - 1;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{template.title}</h1>
          <p className="text-muted-foreground">
            Answer the following questions honestly to get your results
          </p>
        </div>

        <AssessmentProgress
          currentStep={currentStep}
          totalSteps={template.questions.length}
        />

        <AssessmentQuestion
          question={currentQuestion}
          selectedScore={selectedScore}
          onSelectScore={(score) => setAnswer(currentQuestion.id, score)}
        />

        <div className="flex gap-4 justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <div className="flex gap-3">
            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || selectedScore === null}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Submit Assessment
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={selectedScore === null}>
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
