import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSlots } from "@/features/availability/api/availability.api";
import { formatInViewerTz } from "@/lib/timezone";
import { useBookingStore } from "../store/bookingStore";
import type { SlotItem } from "@/features/availability/types/availability.types";
import type { ConsultationMode } from "@/types/global.types";
import { toast } from "sonner";

interface SlotPickerProps {
  psychologistId: string;
  consultationMode: ConsultationMode;
}

export const SlotPicker = ({ psychologistId, consultationMode }: SlotPickerProps) => {
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedSlotId, setManualSelection } = useBookingStore();

  const from = useMemo(() => new Date().toISOString(), []);
  const to = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString();
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true);
      try {
        const fetched = await getSlots(psychologistId, from, to, consultationMode);
        setSlots(fetched);
      } catch {
        toast.error("Failed to load available slots.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlots();
  }, [psychologistId, consultationMode, from, to]);

  // Group available (non-booked) slots by local date
  const groupedSlots = useMemo(() => {
    const groups: Record<string, SlotItem[]> = {};
    slots
      .filter((s) => !s.isBooked)
      .forEach((slot) => {
        const date = formatInViewerTz(slot.startTime, "yyyy-MM-dd");
        if (!groups[date]) groups[date] = [];
        groups[date].push(slot);
      });
    return groups;
  }, [slots]);

  const availableDates = Object.keys(groupedSlots).sort();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle>Choose a Time Slot</CardTitle>
      </CardHeader>

      {availableDates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No available slots in the next 14 days.
        </div>
      ) : (
        <div className="space-y-4">
          {availableDates.map((date) => (
            <Card key={date}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {formatInViewerTz(date, "EEEE, MMMM d, yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {groupedSlots[date].map((slot) => (
                    <Button
                      key={slot.slotId}
                      variant={selectedSlotId === slot.slotId ? "default" : "outline"}
                      onClick={() => setManualSelection(psychologistId, slot.slotId)}
                    >
                      {formatInViewerTz(slot.startTime, "h:mm a")}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
