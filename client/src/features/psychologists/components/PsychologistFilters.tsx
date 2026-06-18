import { Input } from "@/components/ui/input";
import { usePsychologistFilterStore } from "../store/psychologistFilterStore";
import type { Specialization } from "../types/psychologist.types";

export const PsychologistFilters = () => {
  const { searchQuery, specialization, setSearchQuery, setSpecialization } = usePsychologistFilterStore();

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Input
        placeholder="Search psychologists..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1"
      />
      <select
        value={specialization || ""}
        onChange={(e) => setSpecialization((e.target.value || undefined) as Specialization | undefined)}
        className="w-full sm:w-[200px] h-10 px-3 rounded-md border border-input bg-background text-sm"
      >
        <option value="">All specializations</option>
        <option value="anxiety">Anxiety</option>
        <option value="depression">Depression</option>
        <option value="relationships">Relationships</option>
        <option value="stress">Stress</option>
        <option value="trauma">Trauma</option>
        <option value="grief">Grief</option>
        <option value="self-esteem">Self-esteem</option>
        <option value="sleep">Sleep</option>
        <option value="work-life-balance">Work-life balance</option>
        <option value="other">Other</option>
      </select>
    </div>
  );
};
