import { useState, useEffect } from "react";
import { PsychologistCard } from "./PsychologistCard";
import { PsychologistFilters } from "./PsychologistFilters";
import { listPsychologists } from "../api/psychologist.api";
import type { PsychologistListItem } from "../types/psychologist.types";
import { usePsychologistFilterStore } from "../store/psychologistFilterStore";
import { usePresenceStore } from "@/features/psychologists/store/presenceStore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const PsychologistList = () => {
  const { searchQuery, specialization } = usePsychologistFilterStore();
  const isOnline = usePresenceStore((state) => state.isOnline);
  const [psychologists, setPsychologists] = useState<PsychologistListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPsychologists = async () => {
      setIsLoading(true);
      try {
        const { items } = await listPsychologists({
          specialization: specialization ?? undefined,
          page: 1,
          limit: 50,
        });
        setPsychologists(items);
      } catch (error) {
        toast.error("Failed to load psychologists");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPsychologists();
  }, [specialization]);

  // Merge live presence state into the list items
  const enriched = psychologists
    .map((p) => ({ ...p, isOnline: isOnline(p.id) }))
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.bio.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PsychologistFilters />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PsychologistFilters />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enriched.map((psychologist) => (
          <PsychologistCard key={psychologist.id} psychologist={psychologist} />
        ))}
        {enriched.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No psychologists found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};
