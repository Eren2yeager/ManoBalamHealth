import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInViewerTz, getViewerTimezone, localToUtcIso } from "@/lib/timezone";
import { useBookingStore } from "../store/bookingStore";
import type { Specialization } from "@/features/psychologists/types/psychologist.types";

const SPECIALIZATION_OPTIONS: { value: Specialization; label: string }[] = [
  { value: "anxiety", label: "Anxiety" },
  { value: "depression", label: "Depression" },
  { value: "relationships", label: "Relationships" },
  { value: "stress", label: "Stress" },
  { value: "trauma", label: "Trauma" },
  { value: "grief", label: "Grief" },
  { value: "self-esteem", label: "Self-esteem" },
  { value: "sleep", label: "Sleep" },
  { value: "work-life-balance", label: "Work-life balance" },
  { value: "other", label: "Other" },
];

const minDateString = () => DateTime.now().setZone(getViewerTimezone()).toFormat("yyyy-MM-dd");

export const AutoTimeWindowPicker = () => {
  const { preferredWindow, specialization, setAutoSelection } = useBookingStore();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (preferredWindow) {
      const fromLocal = DateTime.fromISO(preferredWindow.from, { zone: "utc" }).setZone(
        getViewerTimezone()
      );
      const toLocal = DateTime.fromISO(preferredWindow.to, { zone: "utc" }).setZone(
        getViewerTimezone()
      );

      setDate(fromLocal.toFormat("yyyy-MM-dd"));
      setStartTime(fromLocal.toFormat("HH:mm"));
      setEndTime(toLocal.toFormat("HH:mm"));
      return;
    }

    const defaultDate = minDateString();
    const zone = getViewerTimezone();
    const fromLocal = DateTime.fromISO(`${defaultDate}T09:00`, { zone });
    const toLocal = DateTime.fromISO(`${defaultDate}T17:00`, { zone });

    setDate(defaultDate);
    setStartTime("09:00");
    setEndTime("17:00");
    setAutoSelection(localToUtcIso(fromLocal), localToUtcIso(toLocal), null);
  }, [preferredWindow, setAutoSelection]);

  const preview = useMemo(() => {
    if (!preferredWindow) return null;

    return `${formatInViewerTz(preferredWindow.from, "EEEE, MMMM d · h:mm a")} – ${formatInViewerTz(preferredWindow.to, "h:mm a")}`;
  }, [preferredWindow]);

  const applySelection = (
    nextDate: string,
    nextStart: string,
    nextEnd: string,
    nextSpecialization: string | null
  ) => {
    if (!nextDate || !nextStart || !nextEnd) {
      setValidationError("Please select a date and time window.");
      return;
    }

    const zone = getViewerTimezone();
    const fromLocal = DateTime.fromISO(`${nextDate}T${nextStart}`, { zone });
    const toLocal = DateTime.fromISO(`${nextDate}T${nextEnd}`, { zone });

    if (!fromLocal.isValid || !toLocal.isValid) {
      setValidationError("Please enter a valid date and time.");
      return;
    }

    if (toLocal <= fromLocal) {
      setValidationError("End time must be after start time.");
      return;
    }

    if (fromLocal < DateTime.now().setZone(zone)) {
      setValidationError("Your preferred window cannot start in the past.");
      return;
    }

    setValidationError(null);
    setAutoSelection(
      localToUtcIso(fromLocal),
      localToUtcIso(toLocal),
      nextSpecialization ?? undefined
    );
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    applySelection(value, startTime, endTime, specialization);
  };

  const handleStartChange = (value: string) => {
    setStartTime(value);
    applySelection(date, value, endTime, specialization);
  };

  const handleEndChange = (value: string) => {
    setEndTime(value);
    applySelection(date, startTime, value, specialization);
  };

  const handleSpecializationChange = (value: string) => {
    const nextSpecialization = value === "any" ? null : (value as Specialization);
    applySelection(date, startTime, endTime, nextSpecialization);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>When would you like your session?</CardTitle>
        <p className="text-sm text-muted-foreground">
          We&apos;ll match you with an available psychologist within this window, in your local
          timezone.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="preferred-date">Date</Label>
          <Input
            id="preferred-date"
            type="date"
            min={minDateString()}
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="window-start">From</Label>
            <Input
              id="window-start"
              type="time"
              value={startTime}
              onChange={(e) => handleStartChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="window-end">To</Label>
            <Input
              id="window-end"
              type="time"
              value={endTime}
              onChange={(e) => handleEndChange(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization (optional)</Label>
          <Select
            value={specialization ?? "any"}
            onValueChange={handleSpecializationChange}
          >
            <SelectTrigger id="specialization" className="w-full">
              <SelectValue placeholder="Any specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any specialization</SelectItem>
              {SPECIALIZATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {preview && !validationError && (
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium text-foreground">Selected window</p>
            <p className="text-muted-foreground mt-1">{preview}</p>
          </div>
        )}

        <p className="text-sm text-destructive min-h-5">
          {validationError ?? ""}
        </p>
      </CardContent>
    </Card>
  );
};
