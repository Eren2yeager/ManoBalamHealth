import { Card, CardContent } from "@/components/ui/card";
import type { AssessmentQuestionItem } from "../types/assessment.types";

interface AssessmentQuestionProps {
  question: AssessmentQuestionItem;
  selectedScore: number | null;
  onSelectScore: (score: number) => void;
}

export function AssessmentQuestion({
  question,
  selectedScore,
  onSelectScore,
}: AssessmentQuestionProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h3 className="text-xl font-semibold mb-6">{question.text}</h3>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onSelectScore(option.score)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedScore === option.score
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
