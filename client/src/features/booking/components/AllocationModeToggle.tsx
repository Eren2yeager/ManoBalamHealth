import { Button } from "@/components/ui/button";
import { useBookingStore } from "../store/bookingStore";
import type { AllocationMode } from "@/types/global.types";

const MODES: { value: AllocationMode; label: string; description: string }[] = [
  {
    value: "manual",
    label: "Choose My Psychologist",
    description: "Browse and select your preferred psychologist and time slot",
  },
  {
    value: "auto",
    label: "Match Me Automatically",
    description: "Let us find you an available psychologist based on your preferences",
  },
];

export const AllocationModeToggle = () => {
  const { allocationMode, setAllocationMode } = useBookingStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {MODES.map((mode) => (
        <Button
          key={mode.value}
          variant={allocationMode === mode.value ? "default" : "outline"}
          className="h-auto p-6 flex flex-col items-start text-left"
          onClick={() => setAllocationMode(mode.value)}
        >
          <div className="font-semibold mb-1">{mode.label}</div>
          <div className="text-sm text-muted-foreground">{mode.description}</div>
        </Button>
      ))}
    </div>
  );
};
