import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { PsychologistProfileView } from "../components/PsychologistProfileView";
import { getPsychologistById } from "../api/psychologist.api";
import type { PsychologistDetail } from "../types/psychologist.types";
import { toast } from "sonner";

export const PsychologistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [psychologist, setPsychologist] = useState<PsychologistDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPsychologist = async () => {
      setIsLoading(true);
      try {
        const data = await getPsychologistById(id);
        setPsychologist(data);
      } catch (error) {
        toast.error("Failed to load psychologist details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPsychologist();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-24" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!psychologist) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Psychologist not found.</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <PsychologistProfileView psychologist={psychologist} />
      </div>
    </div>
  );
};
