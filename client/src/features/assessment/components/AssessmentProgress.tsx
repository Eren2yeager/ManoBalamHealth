interface AssessmentProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function AssessmentProgress({
  currentStep,
  totalSteps,
}: AssessmentProgressProps) {
  const percentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>Question {currentStep + 1} of {totalSteps}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
