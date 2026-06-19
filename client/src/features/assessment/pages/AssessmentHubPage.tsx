import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AssessmentType } from "../types/assessment.types";

const ASSESSMENTS: { type: AssessmentType; title: string; description: string }[] = [
  {
    type: "anxiety",
    title: "Anxiety Screening",
    description: "Assess your anxiety levels with a validated questionnaire.",
  },
  {
    type: "depression",
    title: "Depression Screening",
    description: "Understand your mood and identify signs of depression.",
  },
  {
    type: "stress",
    title: "Stress Assessment",
    description: "Measure your current stress load and coping capacity.",
  },
];

export function AssessmentHubPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Self-Assessment</h1>
          <p className="mt-1 text-muted-foreground">
            Take a short screener to understand your mental health better.
            Results are confidential and used only to guide your care.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ASSESSMENTS.map((a) => (
            <Card key={a.type} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{a.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <p className="text-sm text-muted-foreground">{a.description}</p>
                <Button onClick={() => navigate(`/assessment/${a.type}`)}>
                  Start
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
