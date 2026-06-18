import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSlots } from "@/features/availability/api/availability.api";
import { formatInViewerTz } from "@/lib/timezone";
import { useBookingStore } from "../store/bookingStore";
import type { AvailableSlot } from "@/features/availability/types/availability.types";
import type { ConsultationMode } from "@/types/global.types";
import { toast } from "sonner";

interface SlotPickerProps {
  psychologistId: string;
  consultationMode: ConsultationMode;
}

export const SlotPicker = ({ psychologistId, consultationMode }: SlotPickerProps) => {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedSlotId, setManualSelection } = useBookingStore();

  const today = new Date();
  const from = today.toISOString();
  const to = new Date(today.setDate(today.getDate() + 14)).toISOString();

  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true);
      try {
        const fetchedSlots = await getSlots({
          psychologistId,
          from,
          to,
          consultationMode,
        });
        setSlots(fetchedSlots);
      } catch (error) {
        toast.error("Failed to load slots");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlots();
  }, [psychologistId, consultationMode, from, to]);

  const groupedSlots: Record<string, AvailableSlot[]> = {};
  slots.forEach((slot) => {
    const date = formatInViewerTz(slot.startTime, "yyyy-MM-dd");
    if (!groupedSlots[date]) {
      groupedSlots[date] = [];
    }
    groupedSlots[date].push(slot);
  });

  const handleSlotSelect = (slot: AvailableSlot) => {
    setManualSelection(psychologistId, slot.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading available slots...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader>
        <CardTitle>Choose a Time Slot</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        {Object.keys(groupedSlots).sort().map((date) => (
          <Card key={date}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {formatInViewerTz(date, "EEEE, MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {groupedSlots[date]
                  .filter((s) => s.status === "available")
                  .map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedSlotId === slot.id ? "default" : "outline"}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      {formatInViewerTz(slot.startTime, "h:mm a")}
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {slots.filter((s) => s.status === "available").length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No available slots in the next 14 days.
          </div>
        )}
      </div>
    </div>
  );
};
