import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrisisBanner } from "../../crisis/components/CrisisBanner";
import { Calendar, Star, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import type { AssessmentResult as AssessmentResultType } from "../types/assessment.types";
import type { RiskLevel } from "@/types/global.types";

interface AssessmentResultProps {
  result: AssessmentResultType;
}

const riskLevelConfig: Record<
  RiskLevel,
  { 
    colorClass: string; 
    bgClass: string; 
    borderClass: string;
    icon: React.ReactNode;
  }
> = {
  low: {
    colorClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
    icon: <CheckCircle2 className="size-10" />,
  },
  moderate: {
    colorClass: "text-amber-700",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    icon: <Activity className="size-10" />,
  },
  high: {
    colorClass: "text-orange-700",
    bgClass: "bg-orange-50",
    borderClass: "border-orange-200",
    icon: <AlertTriangle className="size-10" />,
  },
  severe: {
    colorClass: "text-red-700",
    bgClass: "bg-red-50",
    borderClass: "border-red-200",
    icon: <AlertTriangle className="size-10" />,
  },
};

export function AssessmentResult({ result }: AssessmentResultProps) {
  const config = riskLevelConfig[result.riskLevel];

  return (
    <div className="max-w-4xl mx-auto">
      {result.triggeredCrisisFlow && result.crisisResources && (
        <div className="mb-8">
          <CrisisBanner resources={result.crisisResources} />
        </div>
      )}

      <Card className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white pb-8 pt-8">
          <div className="flex items-center gap-3 mb-2">
            <Star className="text-primary size-6" />
            <CardTitle className="text-2xl font-black tracking-tight text-slate-950">
              Your assessment results
            </CardTitle>
          </div>
          <p className="text-sm text-slate-600">
            Here's how you're doing today
          </p>
        </CardHeader>
        <CardContent className="pt-8 pb-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div
              className={`p-6 rounded-[2rem] border-2 text-center ${config.bgClass} ${config.borderClass}`}
            >
              <div className={`${config.colorClass} mb-4 inline-flex`}>
                {config.icon}
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] mb-2 text-slate-500">
                Risk Level
              </p>
              <p className={`text-3xl font-black capitalize ${config.colorClass}`}>
                {result.resultLabel} ({result.riskLevel})
              </p>
            </div>

            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 text-center">
              <Activity className="text-violet-600 size-10 mx-auto mb-4" />
              <p className="text-xs font-bold uppercase tracking-[0.16em] mb-2 text-slate-500">
                Total Score
              </p>
              <p className="text-4xl font-black text-violet-700">
                {result.totalScore}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8">
            <h3 className="text-lg font-black tracking-tight text-slate-950 mb-4 flex items-center gap-2">
              <Calendar className="text-primary size-5" />
              What's next?
            </h3>
            <div className="rounded-[1.5rem] bg-slate-50 border border-slate-100 p-6">
              <p className="text-sm leading-relaxed text-slate-700">
                {result.riskLevel === "low"
                  ? "Great job! Consider booking a regular check-in with a psychologist to maintain your mental well-being."
                  : result.riskLevel === "moderate"
                  ? "We recommend booking a session with a psychologist to discuss your results."
                  : "It's important to seek professional help soon. Please book a session or contact our crisis resources."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
