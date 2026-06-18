import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PsychologistProfileView } from "../components/PsychologistProfileView";
import { getPsychologistById } from "../api/psychologist.api";
import type { Psychologist } from "../types/psychologist.types";
import { toast } from "sonner";

export const PsychologistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
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
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPsychologist();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-muted-foreground">Loading psychologist details...</div>
      </div>
    );
  }

  if (!psychologist) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-muted-foreground">Psychologist not found</div>
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
