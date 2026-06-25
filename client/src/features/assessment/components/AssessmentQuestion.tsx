import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AssessmentQuestionItem } from "../types/assessment.types";
import { CheckCircle2 } from "lucide-react";

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
    <Card className="mb-6 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white pb-6 pt-6">
        <h3 className="text-xl font-black tracking-tight text-slate-950">
          {question.text}
        </h3>
      </CardHeader>
      <CardContent className="pt-6 pb-6">
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onSelectScore(option.score)}
              className={`group relative w-full text-left p-4 rounded-[1.5rem] border-2 transition-all duration-200 ${
                selectedScore === option.score
                  ? "border-primary bg-gradient-to-r from-primary/10 to-violet-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-primary/30 hover:bg-slate-50"
              }`}
            >
              {selectedScore === option.score && (
                <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-primary size-5" />
              )}
              <span className={`text-base ${selectedScore === option.score ? "font-semibold" : "font-medium text-slate-700"}`}>
                {option.text}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
