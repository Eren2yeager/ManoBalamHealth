import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PsychologistCard } from "./PsychologistCard";
import { PsychologistFilters } from "./PsychologistFilters";
import { listPsychologists } from "../api/psychologist.api";
import type { PsychologistListItem } from "../types/psychologist.types";
import { usePsychologistFilterStore } from "../store/psychologistFilterStore";
import { usePresenceStore } from "@/features/psychologists/store/presenceStore";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { SPECIALIZATION_LABEL } from "../constants/psychologist.constants";
import type { Specialization } from "../constants/psychologist.constants";

function CardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-4">
      <div className="flex gap-4">
        <Skeleton className="size-[72px] rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-2 justify-center">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-5 w-14 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-3 border-y border-border py-3">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
      <Skeleton className="h-10 rounded-lg" />
    </div>
  );
}

export const PsychologistList = () => {
  const { specializations, languages, minRating, sortBy, toggleSpecialization, toggleLanguage } =
    usePsychologistFilterStore();
  const isOnline = usePresenceStore((state) => state.isOnline);

  const [inputValue, setInputValue] = useState("");
  const debouncedSearch = useDebounce(inputValue, 400);
  const [psychologists, setPsychologists] = useState<PsychologistListItem[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch whenever API-level filters change
  const fetchPsychologists = useCallback(async () => {
    setIsFetching(true);
    try {
      const { items } = await listPsychologists({
        specialization: specializations.length > 0 ? specializations.join(",") : undefined,
        language: languages.length > 0 ? languages[0] : undefined,
        minRating: minRating > 1 ? minRating : undefined,
        sortBy,
        page: 1,
        limit: 50,
      });
      setPsychologists(items);
    } catch {
      toast.error("Failed to load psychologists");
    } finally {
      setIsFetching(false);
      setIsInitialLoad(false);
    }
  }, [specializations, languages, minRating, sortBy]);

  useEffect(() => {
    fetchPsychologists();
  }, [fetchPsychologists]);

  // Merge live presence + client-side search filter (uses debounced value directly)
  const enriched = psychologists
    .map((p) => ({ ...p, isOnline: isOnline(p.id) }))
    .filter(
      (p) =>
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.bio.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

  // Active filter chips (for the tag bar)
  const activeSpecChips = specializations.map((s) => ({
    key: `spec-${s}`,
    label: SPECIALIZATION_LABEL[s as Specialization] ?? s,
    remove: () => toggleSpecialization(s),
  }));
  const activeLangChips = languages.map((l) => ({
    key: `lang-${l}`,
    label: l,
    remove: () => toggleLanguage(l),
  }));
  const activeChips = [...activeSpecChips, ...activeLangChips];

  return (
    <div className="flex flex-1 min-h-0">
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:block w-[260px] shrink-0 border-r border-border sticky top-16 h-[calc(100vh-64px)] overflow-y-auto p-6 bg-background">
        <PsychologistFilters />
      </aside>

      {/* ── Mobile filter drawer ─────────────────────────────────────────── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-[280px] h-full bg-background shadow-xl overflow-y-auto p-6">
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
            <PsychologistFilters />
          </div>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-4 md:p-8 bg-background">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h1 className="font-[Manrope,sans-serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
              Find a Psychologist
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connect with licensed professionals tailored to your needs.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search names or keywords..."
                className="pl-9 h-9 bg-card"
              />
            </div>
            {/* Mobile filter button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center justify-center p-2 border border-border rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {activeChips.map(({ key, label, remove }) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-xs font-medium text-foreground"
              >
                {label}
                <button
                  type="button"
                  onClick={remove}
                  className="ml-0.5 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remove ${label} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Card grid */}
        {isInitialLoad ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : enriched.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <Search className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No psychologists found</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your filters or search query.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 transition-opacity duration-200"
            style={{ opacity: isFetching ? 0.5 : 1 }}
          >
            {enriched.map((p, i) => (
              <PsychologistCard
                key={p.id}
                psychologist={p}
                style={{ animationDelay: `${i * 0.05}s` }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
