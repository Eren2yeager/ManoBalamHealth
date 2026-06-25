import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search, ShieldCheck, Star, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { listPsychologists } from "@/features/psychologists/api/psychologist.api";
import type { PsychologistListItem } from "@/features/psychologists/types/psychologist.types";
import { useBookingStore } from "../store/bookingStore";

const formatFee = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100);

export function PsychologistBookingPicker() {
  const selectedPsychologistId = useBookingStore(
    (state) => state.selectedPsychologistId,
  );
  const setSelectedPsychologist = useBookingStore(
    (state) => state.setSelectedPsychologist,
  );
  const [psychologists, setPsychologists] = useState<PsychologistListItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void listPsychologists({ page: 1, limit: 50, sortBy: "rating" })
      .then((result) => {
        if (active) setPsychologists(result.items);
      })
      .catch(() => toast.error("Unable to load psychologists."))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return psychologists;
    return psychologists.filter((psychologist) =>
      [
        psychologist.name,
        psychologist.bio,
        ...psychologist.specialization,
        ...psychologist.languages,
      ].some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [psychologists, query]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">
          Choose your professional
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Who would you like to speak with?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Every professional shown here has completed administrator verification.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, specialization, or language"
          className="h-12 rounded-2xl border-violet-100 bg-white pl-12 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-48 rounded-3xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-violet-200 bg-violet-50/50 p-10 text-center">
          <UserRound className="mx-auto size-8 text-violet-500" />
          <p className="mt-4 font-black text-slate-900">No matching psychologists</p>
          <p className="mt-1 text-sm text-slate-500">
            Try another name, specialization, or language.
          </p>
        </div>
      ) : (
        <div className="grid max-h-[520px] gap-4 overflow-y-auto pr-1 md:grid-cols-2">
          {filtered.map((psychologist) => {
            const selected = psychologist.id === selectedPsychologistId;
            return (
              <button
                type="button"
                key={psychologist.id}
                onClick={() => setSelectedPsychologist(psychologist.id)}
                className={`group relative rounded-3xl border p-5 text-left transition-all duration-300 ${
                  selected
                    ? "border-violet-400 bg-violet-50 shadow-lg shadow-violet-100"
                    : "border-slate-100 bg-white hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg"
                }`}
              >
                {selected && (
                  <CheckCircle2 className="absolute right-4 top-4 size-5 text-violet-600" />
                )}
                <div className="flex items-center gap-4">
                  <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-violet-100 text-violet-700">
                    {psychologist.avatarUrl ? (
                      <img
                        src={psychologist.avatarUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <UserRound className="size-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">
                      {psychologist.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {psychologist.specialization
                        .slice(0, 2)
                        .map((item) => item.replaceAll("-", " "))
                        .join(" · ") || "Mental-health support"}
                    </p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
                  {psychologist.bio || "Compassionate, confidential professional care."}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs">
                  <span className="flex items-center gap-1 font-bold text-amber-600">
                    <Star className="size-3.5 fill-current" />
                    {psychologist.rating.average.toFixed(1)}
                  </span>
                  <span className="font-black text-slate-800">
                    {formatFee(
                      psychologist.consultationFee.amount,
                      psychologist.consultationFee.currency,
                    )}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-emerald-700">
                    <ShieldCheck className="size-3.5" />
                    Verified
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
