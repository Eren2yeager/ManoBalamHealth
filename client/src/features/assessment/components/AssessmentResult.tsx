import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrisisBanner } from "../../crisis/components/CrisisBanner";
import type { AssessmentResult as AssessmentResultType } from "../types/assessment.types";

interface AssessmentResultProps {
  result: AssessmentResultType;
}

const riskLevelColors = {
  low: "text-green-700 bg-green-50 border-green-200",
  moderate: "text-yellow-700 bg-yellow-50 border-yellow-200",
  high: "text-red-700 bg-red-50 border-red-200",
  critical: "text-red-800 bg-red-100 border-red-300",
};

export function AssessmentResult({ result }: AssessmentResultProps) {
  const riskLevelClass = riskLevelColors[result.riskLevel];

  return (
    <div className="max-w-2xl mx-auto">
      {result.triggeredCrisisFlow && result.crisisResources && (
        <CrisisBanner resources={result.crisisResources} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Assessment Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className={`p-4 rounded-lg border-2 text-center ${riskLevelClass}`}
          >
            <p className="text-sm font-medium uppercase tracking-wide mb-2">
              Risk Level
            </p>
            <p className="text-3xl font-bold capitalize">{result.riskLevel}</p>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground">Total Score</p>
            <p className="text-4xl font-bold mt-1">{result.totalScore}</p>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Next Steps</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                {result.riskLevel === "low"
                  ? "Great job! Consider booking a regular check-in with a psychologist to maintain your mental well-being."
                  : result.riskLevel === "moderate"
                  ? "We recommend booking a session with a psychologist to discuss your results."
                  : "It's important to seek professional help soon. Please book a session or contact our crisis resources."}
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
