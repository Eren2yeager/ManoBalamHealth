import type { ConsultationMode } from "@/types/global.types";

export interface AvailabilityRuleDto {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string; // "HH:mm"
  endTime: string;
  slotDurationMinutes: 30 | 45 | 60;
  modes: ConsultationMode[];
}

export interface SlotItem {
  slotId: string;
  startTime: string; // ISO UTC — convert via lib/timezone.ts before display
  endTime: string;
  mode: ConsultationMode;
  isBooked: boolean;
}