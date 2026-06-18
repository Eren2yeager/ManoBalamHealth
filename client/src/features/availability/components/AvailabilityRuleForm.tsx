import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAvailabilityRule } from "../api/availability.api";
import type {
  CreateAvailabilityRuleDto,
  Weekday,
} from "../types/availability.types";
import type { ConsultationMode } from "@/types/global.types";
import { toast } from "sonner";

interface AvailabilityRuleFormProps {
  onSuccess?: () => void;
}

const WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const MODES: ConsultationMode[] = ["chat", "audio", "video"];

export const AvailabilityRuleForm = ({ onSuccess }: AvailabilityRuleFormProps) => {
  const [formData, setFormData] = useState<CreateAvailabilityRuleDto>({
    weekday: "monday",
    startTime: "09:00",
    endTime: "17:00",
    consultationModes: ["chat", "audio"],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createAvailabilityRule(formData);
      toast.success("Availability rule created successfully");
      onSuccess?.();
      setFormData({
        weekday: "monday",
        startTime: "09:00",
        endTime: "17:00",
        consultationModes: ["chat", "audio"],
      });
    } catch (error) {
      toast.error("Failed to create availability rule");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = (mode: ConsultationMode) => {
    setFormData((prev) => ({
      ...prev,
      consultationModes: prev.consultationModes.includes(mode)
        ? prev.consultationModes.filter((m) => m !== mode)
        : [...prev.consultationModes, mode],
    }));
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Availability Rule</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weekday">Weekday</Label>
            <select
              id="weekday"
              value={formData.weekday}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                weekday: e.target.value as Weekday,
              }))}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              {WEEKDAYS.map((day) => (
                <option key={day} value={day}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  startTime: e.target.value,
                }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  endTime: e.target.value,
                }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Consultation Modes</Label>
            <div className="flex flex-wrap gap-2">
              {MODES.map((mode) => (
                <Badge
                  key={mode}
                  variant={formData.consultationModes.includes(mode) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => toggleMode(mode)}
                >
                  {mode}
                </Badge>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Rule"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
