import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  HeartHandshake,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PsychologistCard } from "./PsychologistCard";
import { PsychologistFilters } from "./PsychologistFilters";
import { listPsychologists } from "../api/psychologist.api";
import type { PsychologistListItem } from "../types/psychologist.types";
import { usePsychologistFilterStore } from "../store/psychologistFilterStore";
import { usePresenceStore } from "../store/presenceStore";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { SPECIALIZATION_LABEL } from "../constants/psychologist.constants";
import type {
  Specialization,
} from "../constants/psychologist.constants";
import type { SortBy } from "../store/psychologistFilterStore";

const animationClasses = [
  "",
  "delay-[70ms]",
  "delay-[140ms]",
  "delay-[210ms]",
  "delay-[280ms]",
  "delay-[350ms]",
];

function CardSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="size-18 rounded-2xl" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-5 h-5 w-3/5" />
      <Skeleton className="mt-2 h-3 w-2/5" />
      <div className="mt-5 flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-10 w-full" />
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
      <Skeleton className="mt-5 h-11 rounded-xl" />
    </div>
  );
}

export const PsychologistList = () => {
  const {
    specializations,
    languages,
    minRating,
    sortBy,
    toggleSpecialization,
    toggleLanguage,
    setMinRating,
    setSortBy,
    resetFilters,
  } = usePsychologistFilterStore();
  const isLiveOnline = usePresenceStore((state) => state.isOnline);

  const [inputValue, setInputValue] = useState("");
  const debouncedSearch = useDebounce(inputValue, 350);
  const [psychologists, setPsychologists] = useState<PsychologistListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchPsychologists = useCallback(async () => {
    setIsFetching(true);
    try {
      const result = await listPsychologists({
        specialization:
          specializations.length > 0 ? specializations.join(",") : undefined,
        language: languages.length > 0 ? languages[0] : undefined,
        minRating: minRating > 1 ? minRating : undefined,
        sortBy,
        page: 1,
        limit: 50,
      });
      setPsychologists(result.items);
      setTotal(result.meta.total);
    } catch {
      toast.error("We could not load psychologists. Please try again.");
      setPsychologists([]);
      setTotal(0);
    } finally {
      setIsFetching(false);
      setIsInitialLoad(false);
    }
  }, [specializations, languages, minRating, sortBy]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchPsychologists();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchPsychologists]);

  const enriched = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return psychologists
      .map((psychologist) => ({
        ...psychologist,
        isOnline: psychologist.isOnline || isLiveOnline(psychologist.id),
      }))
      .filter((psychologist) => {
        if (!query) return true;
        return [
          psychologist.name,
          psychologist.bio,
          ...psychologist.specialization,
          ...psychologist.languages,
        ].some((value) => value.toLowerCase().includes(query));
      });
  }, [psychologists, debouncedSearch, isLiveOnline]);

  const activeChips = [
    ...specializations.map((specialization) => ({
      key: `specialization-${specialization}`,
      label:
        SPECIALIZATION_LABEL[specialization as Specialization] ?? specialization,
      remove: () => toggleSpecialization(specialization),
    })),
    ...languages.map((language) => ({
      key: `language-${language}`,
      label: language,
      remove: () => toggleLanguage(language),
    })),
    ...(minRating > 1
      ? [
          {
            key: "minimum-rating",
            label: `${minRating.toFixed(1)}+ rating`,
            remove: () => setMinRating(1),
          },
        ]
      : []),
  ];

  const onlineCount = enriched.filter((psychologist) => psychologist.isOnline).length;

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50/45 to-blue-50/50 px-4 py-12 md:px-8">
        <div className="pointer-events-none absolute -right-28 -top-32 size-96 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/4 size-72 rounded-full bg-blue-300/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl animate-in fade-in slide-in-from-left-4 duration-700">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/75 px-4 py-2 text-xs font-black text-primary shadow-sm backdrop-blur">
                <Sparkles className="size-3.5" />
                Verified mental-health professionals
              </span>
              <h1 className="mt-5 text-balance text-4xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">
                Find support that feels{" "}
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  right for you
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate-600">
                Explore approved psychologists by specialization, language, experience,
                rating, and consultation fee.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="rounded-2xl border border-white bg-white/70 p-4 text-center shadow-sm backdrop-blur">
                <Users className="mx-auto size-5 text-primary" />
                <p className="mt-2 text-xl font-black text-slate-900">{total}</p>
                <p className="text-[10px] font-semibold text-slate-500">Results</p>
              </div>
              <div className="rounded-2xl border border-white bg-white/70 p-4 text-center shadow-sm backdrop-blur">
                <CheckCircle2 className="mx-auto size-5 text-emerald-600" />
                <p className="mt-2 text-xl font-black text-slate-900">100%</p>
                <p className="text-[10px] font-semibold text-slate-500">Approved</p>
              </div>
              <div className="rounded-2xl border border-white bg-white/70 p-4 text-center shadow-sm backdrop-blur">
                <HeartHandshake className="mx-auto size-5 text-rose-500" />
                <p className="mt-2 text-xl font-black text-slate-900">{onlineCount}</p>
                <p className="text-[10px] font-semibold text-slate-500">Online</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 rounded-3xl border border-white bg-white/80 p-3 shadow-xl shadow-primary/5 backdrop-blur md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <Input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Search by name, concern, language, or keyword..."
                className="h-12 rounded-2xl border-0 bg-slate-50 pl-12 pr-10 text-sm shadow-none focus-visible:ring-primary/20"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => setInputValue("")}
                  className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
              <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-slate-50 px-4 md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top rated</SelectItem>
                <SelectItem value="experience">Most experienced</SelectItem>
                <SelectItem value="fee_asc">Fee: low to high</SelectItem>
                <SelectItem value="fee_desc">Fee: high to low</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="h-12 rounded-2xl border-violet-100 bg-violet-50 px-5 font-bold text-primary lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="mr-2 size-4" />
              Filters
              {activeChips.length > 0 && (
                <span className="ml-2 grid size-5 place-items-center rounded-full bg-primary text-[10px] text-white">
                  {activeChips.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </section>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] flex lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <aside className="relative ml-auto h-full w-[min(88vw,360px)] animate-in slide-in-from-right overflow-y-auto bg-white p-6 shadow-2xl duration-300">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900"
              aria-label="Close filters"
            >
              <X className="size-5" />
            </button>
            <div className="pt-10">
              <PsychologistFilters />
              <Button
                className="mt-6 h-11 w-full rounded-xl bg-gradient-to-r from-primary to-violet-600 font-bold"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Show {enriched.length} results
              </Button>
            </div>
          </aside>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-8 md:px-8 lg:grid-cols-[270px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
            <PsychologistFilters />
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                {isInitialLoad ? "Finding psychologists..." : `${enriched.length} professionals`}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Select a profile to view approach, fees, and available appointments.
              </p>
            </div>
            {isFetching && !isInitialLoad && (
              <span className="flex items-center gap-2 text-xs font-bold text-primary">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                Updating results
              </span>
            )}
          </div>

          {activeChips.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {activeChips.map(({ key, label, remove }) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-primary"
                >
                  {label}
                  <button
                    type="button"
                    onClick={remove}
                    className="rounded-full p-0.5 hover:bg-violet-100"
                    aria-label={`Remove ${label} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="px-2 text-xs font-bold text-slate-400 hover:text-primary"
              >
                Clear all
              </button>
            </div>
          )}

          {isInitialLoad ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : enriched.length === 0 ? (
            <div className="flex min-h-96 flex-col items-center justify-center rounded-[2rem] border border-dashed border-violet-200 bg-gradient-to-br from-violet-50/70 to-white p-8 text-center">
              <span className="grid size-16 place-items-center rounded-3xl bg-white text-primary shadow-lg">
                <Search className="size-7" />
              </span>
              <h3 className="mt-5 text-xl font-black text-slate-900">
                No matching psychologists
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try a broader search, lower the minimum rating, or remove one of your
                selected filters.
              </p>
              <Button
                variant="outline"
                className="mt-5 rounded-xl"
                onClick={() => {
                  setInputValue("");
                  resetFilters();
                }}
              >
                Reset search and filters
              </Button>
            </div>
          ) : (
            <div
              className={`grid gap-5 transition-opacity duration-300 md:grid-cols-2 xl:grid-cols-3 ${
                isFetching ? "opacity-55" : "opacity-100"
              }`}
            >
              {enriched.map((psychologist, index) => (
                <PsychologistCard
                  key={psychologist.id}
                  psychologist={psychologist}
                  animationClass={animationClasses[index % animationClasses.length]}
                />
              ))}
            </div>
          )}

          {!isInitialLoad && enriched.length > 0 && (
            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-800">
              <ShieldCheck className="size-5 shrink-0" />
              Every profile shown here has passed the platform’s administrator
              verification process.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
