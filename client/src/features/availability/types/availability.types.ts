import type { ConsultationMode } from "@/types/global.types";

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface RecurringAvailabilityRule {
  id: string;
  psychologistId: string;
  weekday: Weekday;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  consultationModes: ConsultationMode[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlot {
  id: string;
  psychologistId: string;
  startTime: string; // ISO string in UTC
  endTime: string; // ISO string in UTC
  consultationMode: ConsultationMode;
  status: "available" | "booked" | "held";
}

export interface CreateAvailabilityRuleDto {
  weekday: Weekday;
  startTime: string;
  endTime: string;
  consultationModes: ConsultationMode[];
}

export interface GetSlotsParams {
  psychologistId: string;
  from: string; // ISO string
  to: string; // ISO string
  consultationMode?: ConsultationMode;
}
