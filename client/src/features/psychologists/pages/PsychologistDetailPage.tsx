import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCcw, UserRoundSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PsychologistProfileView } from "../components/PsychologistProfileView";
import { getPsychologistById } from "../api/psychologist.api";
import type { PsychologistDetail } from "../types/psychologist.types";
import { toast } from "sonner";

export const PsychologistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [psychologist, setPsychologist] =
    useState<PsychologistDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const loadPsychologist = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setLoadFailed(false);
    try {
      setPsychologist(await getPsychologistById(id));
    } catch {
      setLoadFailed(true);
      toast.error("We could not load this psychologist profile.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPsychologist();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadPsychologist]);

  if (isLoading) return <PsychologistProfileSkeleton />;

  if (loadFailed || !psychologist) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#faf9ff] px-4">
        <div className="max-w-md rounded-3xl border border-violet-100 bg-white p-8 text-center shadow-xl">
          <UserRoundSearch className="mx-auto size-10 text-violet-500" />
          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Profile unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This professional profile may no longer be available, or the
            connection was interrupted.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 size-4" />
              Go back
            </Button>
            <Button onClick={() => void loadPsychologist()}>
              <RefreshCcw className="mr-2 size-4" />
              Try again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return <PsychologistProfileView psychologist={psychologist} />;
};

function PsychologistProfileSkeleton() {
  return (
    <main className="min-h-screen bg-[#faf9ff] px-4 py-7 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Skeleton className="h-[390px] rounded-[2rem]" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_350px]">
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-52 rounded-3xl" />
          </div>
          <Skeleton className="h-[430px] rounded-3xl" />
        </div>
      </div>
    </main>
  );
}
