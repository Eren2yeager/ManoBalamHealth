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
      <div className="flex justify-between text-sm font-semibold text-slate-700 mb-3">
        <span>Question {currentStep + 1} of {totalSteps}</span>
        <span>{percentage}%</span>
      </div>
      <div className="relative w-full h-3 bg-slate-100 rounded-[1.5rem] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-violet-600 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
