import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PsychologistVerificationCard } from "../components/PsychologistVerificationCard";
import { getPendingPsychologists, verifyPsychologist } from "../api/admin.api";
import type { PendingPsychologistItem, VerifyPsychologistDto } from "../types/admin.types";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

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
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={fetchPsychologists}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Psychologist Verifications</h1>
        <Button variant="outline" onClick={fetchPsychologists} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {psychologists.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pending verifications</h3>
              <p className="text-muted-foreground">Great job keeping up with new signups!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {psychologists.map((psych) => (
            <PsychologistVerificationCard
              key={psych.id}
              psychologist={psych}
              onVerify={handleVerify}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
