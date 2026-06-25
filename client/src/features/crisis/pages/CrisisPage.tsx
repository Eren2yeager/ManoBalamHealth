import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  HeartPulse, 
  Phone, 
  Globe, 
  LoaderCircle, 
  ArrowLeft,
  ShieldAlert,
  MessageCircleHeart,
  HandHeart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCrisisResources } from "../api/crisis.api";
import type { CrisisResource } from "../types/crisis.types";


const emergencyTips = [
  {
    icon: ShieldAlert,
    title: "Stay Safe",
    description: "If you're in immediate danger, call your local emergency services right away."
  },
  {
    icon: MessageCircleHeart,
    title: "Talk to Someone",
    description: "Reach out to a trusted friend, family member, or counselor. You don't have to go through this alone."
  },
  {
    icon: HandHeart,
    title: "Be Kind to Yourself",
    description: "Remember that it's okay to not be okay. Take small steps and be patient with yourself."
  }
];

export function CrisisPage() {
  const [resources, setResources] = useState<CrisisResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadResources = useCallback(async () => {
    try {
      const data = await getCrisisResources();
      setResources(data);
    } catch (error) {
      console.error("Failed to load crisis resources:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[#faf9ff] px-4 py-7 md:px-8 md:py-10">
        <div className="mx-auto max-w-5xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>

          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 px-6 py-10 text-white shadow-2xl md:px-10 md:py-12">
            <div className="absolute -right-20 -top-20 size-80 rounded-full bg-white/15 blur-3xl" />
            <div className="absolute left-10 bottom-0 size-40 rounded-full bg-white/10 blur-2xl" />
            
            <div className="relative flex items-start gap-6">
              <div className="grid size-20 place-items-center rounded-3xl bg-white/20 backdrop-blur-sm shadow-xl">
                <HeartPulse className="size-10" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                  Crisis Support Resources
                </h1>
                <p className="text-lg text-rose-100/90 leading-relaxed max-w-2xl">
                  If you or someone you know is experiencing a mental health crisis, 
                  help is available. Please reach out to one of these trusted resources.
                </p>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-black text-slate-900 mb-4">
                Helplines & Support
              </h2>
              
              {isLoading ? (
                <div className="grid min-h-[300px] place-items-center">
                  <LoaderCircle className="size-8 animate-spin text-rose-500" />
                </div>
              ) : resources.length > 0 ? (
                <div className="grid gap-4">
                  {resources.map((resource) => (
                    <Card 
                      key={resource.id} 
                      className="bg-white border-rose-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="bg-gradient-to-r from-rose-50 to-rose-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="grid size-10 place-items-center rounded-2xl bg-rose-500 text-white shadow-lg">
                            <Phone className="size-5" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-rose-900">
                              {resource.name}
                            </h3>
                            <p className="text-sm text-rose-700 mt-1">
                              {resource.description}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-5">
                        <a
                          href={`tel:${resource.phone}`}
                          className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-bold hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl"
                        >
                          <Phone className="size-6" />
                          <span className="text-lg">Call {resource.phone}</span>
                        </a>
                        {resource.website && (
                          <a
                            href={resource.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-rose-200 text-rose-700 rounded-xl font-bold hover:bg-rose-50 hover:border-rose-300 transition-all"
                          >
                            <Globe className="size-5" />
                            Visit Website
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid min-h-[300px] place-items-center text-slate-500">
                  No crisis resources available at this time.
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900">
                Immediate Steps
              </h2>
              
              {emergencyTips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <Card 
                    key={index} 
                    className="bg-white border-slate-200 rounded-2xl overflow-hidden"
                  >
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-2xl bg-slate-500 text-white">
                          <Icon className="size-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {tip.title}
                        </h3>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-slate-700 leading-relaxed">
                        {tip.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>
  );
}