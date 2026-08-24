import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AssessmentQuestion } from "../components/AssessmentQuestion";
import { AssessmentProgress } from "../components/AssessmentProgress";
import { AssessmentResult } from "../components/AssessmentResult";
import { getAssessmentTemplate, submitAssessment } from "../api/assessment.api";
import { useAssessmentStore } from "../store/assessmentStore";
import { Loader2, ArrowLeft, Languages } from "lucide-react";
import type { AssessmentType } from "../types/assessment.types";
import {
  assessmentLanguageLabels,
  getAssessmentInstruction,
  getAssessmentTitle,
  type AssessmentLanguage,
} from "../utils/assessmentTranslations";

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
  const [language, setLanguage] = useState<AssessmentLanguage>("en");

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
    if (!template || !type) return;
    setIsSubmitting(true);
    try {
      const payload = {
        templateType: type as AssessmentType,
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
      <div className="min-h-screen bg-slate-50/60">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <header className="mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                reset();
                navigate("/assessment");
              }}
              aria-label="Back to assessments"
              className="rounded-xl"
            >
              <ArrowLeft className="size-5" />
            </Button>
          </header>
          <AssessmentResult result={result} />
          <div className="mt-8 text-center">
            <Button
              onClick={() => {
                reset();
                navigate("/assessment");
              }}
              className="h-11 rounded-xl bg-gradient-to-r from-primary to-violet-600 px-8 font-bold shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700"
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50/60">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">
            Loading assessment...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/60">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-black mb-2 text-slate-950">Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button 
            onClick={() => navigate("/assessment")}
            className="h-11 rounded-xl bg-gradient-to-r from-primary to-violet-600 font-bold shadow-lg shadow-violet-200"
          >
            Go Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  if (!template) return null;
  const assessmentType = type as AssessmentType;

  // ── Question flow ─────────────────────────────────────────────────────────
  const currentQuestion = template.questions[currentStep];
  const selectedScore = answers[currentQuestion.id] ?? null;
  const isLastStep = currentStep === template.questions.length - 1;

  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/assessment")}
              aria-label="Back to assessments"
              className="rounded-xl"
            >
              <ArrowLeft className="size-5" />
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-black mb-2 text-slate-950">
              {getAssessmentTitle(assessmentType, template.title, language)}
            </h1>
            <p className="text-sm text-slate-600">
              {getAssessmentInstruction(language)}
            </p>
          </div>
          <div className="mt-5 rounded-3xl border border-violet-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                  <Languages className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-black text-slate-950">Question language</p>
                  <p className="text-xs text-slate-500">
                    {assessmentLanguageLabels[language].helper}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-violet-50 p-1">
                {(["en", "hi"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLanguage(item)}
                    className={`rounded-xl px-4 py-2 text-sm font-black transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 ${
                      language === item
                        ? "bg-white text-violet-700 shadow-sm"
                        : "text-slate-500 hover:text-violet-700"
                    }`}
                  >
                    {assessmentLanguageLabels[item].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <AssessmentProgress
          currentStep={currentStep}
          totalSteps={template.questions.length}
        />

        <AssessmentQuestion
          question={currentQuestion}
          assessmentType={assessmentType}
          language={language}
          selectedScore={selectedScore}
          onSelectScore={(score) => setAnswer(currentQuestion.id, score)}
        />

        <div className="flex gap-4 justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="h-11 rounded-xl px-6 font-bold border-slate-200 hover:bg-slate-50"
          >
            {language === "hi" ? "पीछे" : "Previous"}
          </Button>
          <div className="flex gap-3">
            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || selectedScore === null}
                className="h-11 rounded-xl bg-gradient-to-r from-primary to-violet-600 font-bold shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {language === "hi" ? "जमा करें" : "Submit Assessment"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={selectedScore === null}
                className="h-11 rounded-xl bg-gradient-to-r from-primary to-violet-600 font-bold shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700"
              >
                {language === "hi" ? "आगे" : "Next"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
