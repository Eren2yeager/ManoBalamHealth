import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Calendar, Activity, History, Star } from "lucide-react";
import { getAssessmentHistory } from "../api/assessment.api";
import type { AssessmentHistoryItem } from "../types/assessment.types";
import type { RiskLevel } from "@/types/global.types";

const getRiskLevelConfig = (riskLevel: RiskLevel) => {
  switch (riskLevel) {
    case "low":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "moderate":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "high":
      return "text-orange-700 bg-orange-50 border-orange-200";
    case "severe":
      return "text-red-700 bg-red-50 border-red-200";
    default:
      return "text-slate-700 bg-slate-50 border-slate-200";
  }
};

const getAssessmentTitle = (type: string) => {
  switch (type) {
    case "anxiety":
      return "Anxiety Screening";
    case "depression":
      return "Depression Screening";
    case "stress":
      return "Stress Assessment";
    default:
      return "Assessment";
  }
};



export function AssessmentHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const data = await getAssessmentHistory();
        setHistory(data);
      } catch {
        setError("Failed to load assessment history");
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/60">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">
            Loading history...
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
            Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50/40 to-white px-4 py-8 md:px-8">
        <div className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-blue-300/15 blur-3xl" />
        
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/assessment")}
                className="rounded-xl mb-4 -ml-2"
              >
                <ArrowLeft className="size-5" />
              </Button>
              
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-primary">
                <span className="grid size-9 place-items-center rounded-xl bg-primary/10">
                  <History className="size-4" />
                </span>
                Your mental wellbeing journey
              </div>
              <h1 className="text-3xl font-black tracking-[-0.035em] text-slate-950 md:text-4xl">
                Assessment history
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
                Track your progress and see how your mental wellbeing has changed over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History Content */}
      <section className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          {history.length === 0 ? (
            <Card className="rounded-[2rem] border border-slate-100 bg-white shadow-sm">
              <CardContent className="pt-12 pb-12 text-center">
                <Activity className="size-16 text-violet-300 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-800 mb-2">No assessments yet</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                  Start your first assessment to track your mental health journey over time.
                </p>
                <Button
                  onClick={() => navigate("/assessment")}
                  className="h-11 rounded-xl bg-gradient-to-r from-primary to-violet-600 font-bold shadow-lg shadow-violet-200"
                >
                  Start your first assessment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {history.map((item) => (
                <Card
                  key={item.id}
                  className="rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:border-violet-100 hover:shadow-xl hover:shadow-primary/8 transition-all"
                >
                  <CardHeader className="pb-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-md">
                          <Star className="size-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-black tracking-tight text-slate-950">
                            {getAssessmentTitle(item.templateType)}
                          </CardTitle>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full border font-bold text-sm ${getRiskLevelConfig(item.riskLevel)}`}>
                        {item.resultLabel}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Activity className="size-4 text-primary" />
                        <span>Score: <span className="font-black text-slate-900">{item.totalScore}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="size-4 text-primary" />
                        <span>{new Date(item.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
