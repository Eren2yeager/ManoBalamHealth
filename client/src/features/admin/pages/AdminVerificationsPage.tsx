import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PsychologistVerificationCard } from "../components/PsychologistVerificationCard";
import { getPendingPsychologists, verifyPsychologist } from "../api/admin.api";
import type { PendingPsychologistItem, VerifyPsychologistDto } from "../types/admin.types";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, RefreshCw, Sparkles } from "lucide-react";

export function AdminVerificationsPage() {
  const [psychologists, setPsychologists] = useState<PendingPsychologistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPsychologists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { items } = await getPendingPsychologists({ page: 1, limit: 50 });
      setPsychologists(items);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load pending psychologists";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPsychologists();
  }, [fetchPsychologists]);

  const handleVerify = async (id: string, payload: VerifyPsychologistDto) => {
    try {
      setIsProcessing(true);
      await verifyPsychologist(id, payload);
      toast.success(
        payload.decision === "approved"
          ? "Psychologist approved!"
          : "Psychologist rejected!"
      );
      fetchPsychologists();
    } catch (err) {
      toast.error("Failed to process verification");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-[2rem]" />
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-[2rem]" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="grid min-h-[60vh] place-items-center">
          <Card className="max-w-xl rounded-[2rem]">
            <CardContent className="p-9 text-center">
              <AlertCircle className="mx-auto size-12 text-rose-500" />
              <h2 className="mt-4 text-xl font-black text-slate-950">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-slate-500">{error}</p>
              <Button onClick={fetchPsychologists} className="mt-6 h-11 rounded-xl">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-r from-violet-600 via-primary to-indigo-700 p-7 text-white shadow-xl md:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-white/10 blur-3xl" />
          
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-violet-100">
                <span className="grid size-9 place-items-center rounded-xl bg-white/15">
                  <Sparkles className="size-4" />
                </span>
                Psychologist Reviews
              </div>
              <h1 className="text-3xl font-black tracking-[-0.035em] md:text-4xl">
                Pending Verifications
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-violet-100/80">
                Review and verify new psychologist applications to ensure platform quality.
              </p>
            </div>

            <Button
              onClick={fetchPsychologists}
              className="h-11 rounded-xl bg-white px-6 font-bold text-primary hover:bg-violet-50"
            >
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
          </div>
        </section>

        {/* Content Section */}
        {psychologists.length === 0 ? (
          <Card className="rounded-[2rem] border border-slate-100 bg-white shadow-sm">
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
              <h3 className="mt-4 text-lg font-black text-slate-900">
                No pending verifications
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Great job keeping up with new signups! All applications have been reviewed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {psychologists.map((psychologist) => (
              <PsychologistVerificationCard
                key={psychologist.id}
                psychologist={psychologist}
                onVerify={handleVerify}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
