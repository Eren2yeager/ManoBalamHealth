import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartPulse, Brain, Activity, History, ArrowRight, Sparkles } from "lucide-react";
import type { AssessmentType } from "../types/assessment.types";

const ASSESSMENTS: { 
  type: AssessmentType; 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  gradient: string;
  surface: string;
}[] = [
  {
    type: "anxiety",
    title: "Anxiety Screening",
    description: "Assess your anxiety levels with a validated questionnaire.",
    icon: <HeartPulse className="size-8" />,
    gradient: "from-rose-500 to-pink-600",
    surface: "bg-rose-50 border-rose-100",
  },
  {
    type: "depression",
    title: "Depression Screening",
    description: "Understand your mood and identify signs of depression.",
    icon: <Brain className="size-8" />,
    gradient: "from-blue-500 to-indigo-600",
    surface: "bg-blue-50 border-blue-100",
  },
  {
    type: "stress",
    title: "Stress Assessment",
    description: "Measure your current stress load and coping capacity.",
    icon: <Activity className="size-8" />,
    gradient: "from-amber-500 to-orange-600",
    surface: "bg-amber-50 border-amber-100",
  },
];

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-black tracking-tight text-slate-950">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export function AssessmentHubPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50/40 to-white px-4 py-8 md:px-8">
        <div className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-blue-300/15 blur-3xl" />
        
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-primary">
                <span className="grid size-9 place-items-center rounded-xl bg-primary/10">
                  <Sparkles className="size-4" />
                </span>
                Mental wellbeing check-in
              </div>
              <h1 className="text-3xl font-black tracking-[-0.035em] text-slate-950 md:text-4xl">
                Take a quiet moment for yourself
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
                A guided assessment can help you notice patterns and decide what kind of support may feel useful next.
              </p>
            </div>

            <Button
              onClick={() => navigate("/assessment/history")}
              className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold shadow-lg self-start lg:self-auto"
            >
              <History className="size-5 mr-2" />
              View history
            </Button>
          </div>
        </div>
      </section>

      {/* Assessments Grid */}
      <section className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            title="Choose an assessment"
            description="Pick the check-in that feels most relevant to how you're feeling today."
          />
          
          <div className="grid gap-6 lg:grid-cols-3">
            {ASSESSMENTS.map(({ type, title, description, icon, gradient, surface }) => (
              <button
                key={type}
                onClick={() => navigate(`/assessment/${type}`)}
                className="group text-left"
              >
                <Card
                  className={`relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-2 hover:border-violet-100 hover:shadow-xl hover:shadow-primary/8 ${surface}`}
                >
                  <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <div className="relative text-white drop-shadow-sm">
                      {icon}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl font-black tracking-tight text-slate-950">
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between gap-6">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Button
                        className="h-10 rounded-xl bg-gradient-to-r from-primary to-violet-600 font-bold shadow-md"
                      >
                        Start assessment
                      </Button>
                      <ArrowRight className="size-5 text-slate-300 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
