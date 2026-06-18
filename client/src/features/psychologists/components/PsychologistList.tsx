import { useState, useEffect } from "react";
import { PsychologistCard } from "./PsychologistCard";
import { PsychologistFilters } from "./PsychologistFilters";
import { getPsychologists } from "../api/psychologist.api";
import type { Psychologist } from "../types/psychologist.types";
import { usePsychologistFilterStore } from "../store/psychologistFilterStore";
import { usePresenceStore } from "@/stores/presenceStore";
import { toast } from "sonner";

export const PsychologistList = () => {
  const { searchQuery, specialization } = usePsychologistFilterStore();
  const isPsychologistOnline = usePresenceStore((state) => state.isOnline);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPsychologists = async () => {
      setIsLoading(true);
      try {
        const { psychologists } = await getPsychologists({
          specialization,
        });
        setPsychologists(psychologists);
      } catch (error) {
        toast.error("Failed to load psychologists");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPsychologists();
  }, [specialization]);

  const filteredPsychologists = psychologists
    .map((p) => ({
      ...p,
      isOnline: isPsychologistOnline(p.id),
    }))
    .filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bio.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading psychologists...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PsychologistFilters />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPsychologists.map((psychologist) => (
          <PsychologistCard key={psychologist.id} psychologist={psychologist} />
        ))}
        {filteredPsychologists.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No psychologists found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};
