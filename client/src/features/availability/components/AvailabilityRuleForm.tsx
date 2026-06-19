import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { setRecurringRules } from "../api/availability.api";
import type { AvailabilityRuleDto } from "../types/availability.types";
import type { ConsultationMode } from "@/types/global.types";
import { toast } from "sonner";

interface AvailabilityRuleFormProps {
  onSuccess?: () => void;
}

const DAY_LABELS: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

const DAYS = [0, 1, 2, 3, 4, 5, 6] as const;
const MODES: ConsultationMode[] = ["chat", "audio", "video"];
const DURATIONS: Array<30 | 45 | 60> = [30, 45, 60];

const DEFAULT_RULE: AvailabilityRuleDto = {
  dayOfWeek: 1,
  startTime: "09:00",
  endTime: "17:00",
  slotDurationMinutes: 60,
  modes: ["chat", "audio"],
};

export const AvailabilityRuleForm = ({ onSuccess }: AvailabilityRuleFormProps) => {
  const [rules, setRules] = useState<AvailabilityRuleDto[]>([{ ...DEFAULT_RULE }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateRule = (index: number, patch: Partial<AvailabilityRuleDto>) => {
    setRules((prev) =>
      prev.map((rule, i) => (i === index ? { ...rule, ...patch } : rule))
    );
  };

  const toggleMode = (index: number, mode: ConsultationMode) => {
    setRules((prev) =>
      prev.map((rule, i) => {
        if (i !== index) return rule;
        const modes = rule.modes.includes(mode)
          ? rule.modes.filter((m) => m !== mode)
          : [...rule.modes, mode];
        return { ...rule, modes };
      })
    );
  };

  const addRule = () => setRules((prev) => [...prev, { ...DEFAULT_RULE }]);

  const removeRule = (index: number) =>
    setRules((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const invalid = rules.find((r) => r.modes.length === 0);
    if (invalid) {
      toast.error("Each rule must have at least one consultation mode selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { rulesUpdated } = await setRecurringRules(rules);
      toast.success(`${rulesUpdated} availability rule${rulesUpdated !== 1 ? "s" : ""} saved.`);
      onSuccess?.();
    } catch (err) {
      toast.error("Failed to save availability rules.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {rules.map((rule, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Rule {index + 1}</CardTitle>
            {rules.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRule(index)}
                className="text-destructive hover:text-destructive"
              >
                Remove
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Day of week */}
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <select
                value={rule.dayOfWeek}
                onChange={(e) =>
                  updateRule(index, {
                    dayOfWeek: Number(e.target.value) as AvailabilityRuleDto["dayOfWeek"],
                  })
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {DAY_LABELS[day]}
                  </option>
                ))}
              </select>
            </div>

            {/* Time range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`startTime-${index}`}>Start Time</Label>
                <Input
                  id={`startTime-${index}`}
                  type="time"
                  value={rule.startTime}
                  onChange={(e) => updateRule(index, { startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`endTime-${index}`}>End Time</Label>
                <Input
                  id={`endTime-${index}`}
                  type="time"
                  value={rule.endTime}
                  onChange={(e) => updateRule(index, { endTime: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Slot duration */}
            <div className="space-y-2">
              <Label>Slot Duration</Label>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <Badge
                    key={d}
                    variant={rule.slotDurationMinutes === d ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => updateRule(index, { slotDurationMinutes: d })}
                  >
                    {d} min
                  </Badge>
                ))}
              </div>
            </div>

            {/* Consultation modes */}
            <div className="space-y-2">
              <Label>Consultation Modes</Label>
              <div className="flex gap-2">
                {MODES.map((mode) => (
                  <Badge
                    key={mode}
                    variant={rule.modes.includes(mode) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleMode(index, mode)}
                  >
                    {mode}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={addRule}>
          + Add Rule
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Saving..." : "Save Rules"}
        </Button>
      </div>
    </form>
  );
};
