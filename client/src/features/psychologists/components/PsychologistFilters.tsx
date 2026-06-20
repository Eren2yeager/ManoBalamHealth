import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { usePsychologistFilterStore } from "../store/psychologistFilterStore";
import { SPECIALIZATIONS, LANGUAGES } from "../constants/psychologist.constants";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const FilterSection = ({ title, children, defaultOpen = true }: SectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border pb-4 mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between mb-2 group"
      >
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide group-hover:text-primary transition-colors">
          {title}
        </span>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        }
      </button>
      {open && <div className="flex flex-col gap-2 mt-2">{children}</div>}
    </div>
  );
};

export const PsychologistFilters = () => {
  const {
    specializations, languages, minRating,
    toggleSpecialization, toggleLanguage, setMinRating, resetFilters,
  } = usePsychologistFilterStore();

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-[Manrope,sans-serif] text-base font-semibold text-foreground">
          Filters
        </h2>
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Specialization */}
      <FilterSection title="Specialization">
        {SPECIALIZATIONS.map(({ value, label }) => (
          <Label
            key={value}
            className="flex items-center gap-2 cursor-pointer font-normal text-sm text-foreground hover:text-primary transition-colors"
          >
            <Checkbox
              checked={specializations.includes(value)}
              onCheckedChange={() => toggleSpecialization(value)}
            />
            {label}
          </Label>
        ))}
      </FilterSection>

      {/* Language */}
      <FilterSection title="Language">
        {LANGUAGES.map((lang) => (
          <Label
            key={lang}
            className="flex items-center gap-2 cursor-pointer font-normal text-sm text-foreground hover:text-primary transition-colors"
          >
            <Checkbox
              checked={languages.includes(lang)}
              onCheckedChange={() => toggleLanguage(lang)}
            />
            {lang}
          </Label>
        ))}
      </FilterSection>



      {/* Min Rating */}
      <FilterSection title="Minimum Rating" defaultOpen={true}>
        <input
          type="range"
          min={1}
          max={5}
          step={0.5}
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1.0</span>
          <span className="font-semibold text-primary">{minRating.toFixed(1)}+</span>
          <span>5.0</span>
        </div>
      </FilterSection>
    </div>
  );
};
