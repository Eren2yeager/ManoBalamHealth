import { useState, type ReactNode } from "react";
import {
  ChevronDown,
  Languages as LanguagesIcon,
  RotateCcw,
  Sparkles,
  Star,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePsychologistFilterStore } from "../store/psychologistFilterStore";
import { LANGUAGES, SPECIALIZATIONS } from "../constants/psychologist.constants";

function FilterSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 py-1 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-black text-slate-800">
          <span className="text-primary">{icon}</span>
          {title}
        </span>
        <ChevronDown
          className={`size-4 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${
          open ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
}

export const PsychologistFilters = () => {
  const {
    specializations,
    languages,
    minRating,
    toggleSpecialization,
    toggleLanguage,
    setMinRating,
    resetFilters,
  } = usePsychologistFilterStore();

  const activeCount =
    specializations.length + languages.length + (minRating > 1 ? 1 : 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-950">Filters</h2>
            {activeCount > 0 && (
              <span className="grid size-6 place-items-center rounded-full bg-primary text-xs font-black text-white">
                {activeCount}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Refine the directory around your preferences.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          disabled={activeCount === 0}
          className="rounded-xl text-xs text-primary"
        >
          <RotateCcw className="mr-1 size-3.5" />
          Reset
        </Button>
      </div>

      <FilterSection
        title="Specialization"
        icon={<Sparkles className="size-4" />}
      >
        <div className="grid gap-2.5">
          {SPECIALIZATIONS.map(({ value, label }) => (
            <Label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-violet-50 hover:text-primary"
            >
              <Checkbox
                checked={specializations.includes(value)}
                onCheckedChange={() => toggleSpecialization(value)}
              />
              {label}
            </Label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Language"
        icon={<LanguagesIcon className="size-4" />}
      >
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {LANGUAGES.map((language) => (
            <Label
              key={language}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-violet-50 hover:text-primary"
            >
              <Checkbox
                checked={languages.includes(language)}
                onCheckedChange={() => toggleLanguage(language)}
              />
              {language}
            </Label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Minimum rating"
        icon={<Star className="size-4 fill-current" />}
      >
        <div className="rounded-2xl bg-amber-50/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Any rating</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-amber-700 shadow-sm">
              {minRating.toFixed(1)}+
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={0.5}
            value={minRating}
            onChange={(event) => setMinRating(Number(event.target.value))}
            className="w-full accent-amber-500"
            aria-label="Minimum psychologist rating"
          />
          <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-400">
            <span>1.0</span>
            <span>3.0</span>
            <span>5.0</span>
          </div>
        </div>
      </FilterSection>
    </div>
  );
};
