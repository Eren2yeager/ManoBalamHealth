import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AllocationModeToggle } from "../components/AllocationModeToggle";
import { AutoTimeWindowPicker } from "../components/AutoTimeWindowPicker";
import { ConsultationTypePicker } from "../components/ConsultationTypePicker";
import { SlotPicker } from "../components/SlotPicker";
import { ConcernForm } from "../components/ConcernForm";
import { BookingSummary } from "../components/BookingSummary";
import { useBookingStore } from "../store/bookingStore";

type Step = "mode" | "type" | "schedule" | "concern" | "summary";

const STEP_LABELS: Record<Step, string> = {
  mode: "Mode",
  type: "Type",
  schedule: "Schedule",
  concern: "Concern",
  summary: "Summary",
};

const STEPS: Step[] = ["mode", "type", "schedule", "concern", "summary"];

export const BookingFlowPage = () => {
  const { psychologistId } = useParams<{ psychologistId?: string }>();
  const [step, setStep] = useState<Step>(psychologistId ? "type" : "mode");
  const {
    allocationMode,
    mode,
    selectedSlotId,
    selectedPsychologistId,
    preferredWindow,
    setAllocationMode,
    reset,
  } = useBookingStore();

  const isManualFlow = allocationMode === "manual" || !!psychologistId;
  const visibleSteps = psychologistId ? STEPS.filter((s) => s !== "mode") : STEPS;

  useEffect(() => {
    if (psychologistId) {
      setAllocationMode("manual");
    }
  }, [psychologistId, setAllocationMode]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const canProceed = () => {
    if (step === "mode") return allocationMode === "manual" || allocationMode === "auto";
    if (step === "type") return !!mode;
    if (step === "schedule") {
      if (isManualFlow) return !!selectedSlotId;
      return !!preferredWindow?.from && !!preferredWindow?.to;
    }
    if (step === "concern") return true;
    return true;
  };

  const nextStep = () => {
    const currentIndex = visibleSteps.indexOf(step);
    if (currentIndex < visibleSteps.length - 1) {
      setStep(visibleSteps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = visibleSteps.indexOf(step);
    if (currentIndex > 0) {
      setStep(visibleSteps[currentIndex - 1]);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "mode":
        return <AllocationModeToggle />;
      case "type":
        return <ConsultationTypePicker />;
      case "schedule":
        if (isManualFlow) {
          const resolvedPsychologistId = selectedPsychologistId || psychologistId;
          if (!resolvedPsychologistId || !mode) return null;
          return (
            <SlotPicker psychologistId={resolvedPsychologistId} consultationMode={mode} />
          );
        }
        return <AutoTimeWindowPicker />;
      case "concern":
        return <ConcernForm />;
      case "summary":
        return <BookingSummary onBack={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-center gap-2 overflow-x-auto">
          {visibleSteps.map((s, i) => (
            <div
              key={s}
              className={`flex items-center gap-2 shrink-0 ${
                s === step ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm ${
                  s === step
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted"
                }`}
              >
                {i + 1}
              </div>
              <span className="text-xs hidden sm:inline">{STEP_LABELS[s]}</span>
              {i < visibleSteps.length - 1 && (
                <div className={`h-0.5 w-6 sm:w-8 ${s === step ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-[400px]">{renderStep()}</div>

        {step !== "summary" && (
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              disabled={visibleSteps.indexOf(step) === 0}
              onClick={prevStep}
            >
              Back
            </Button>
            <Button onClick={nextStep} disabled={!canProceed()}>
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
