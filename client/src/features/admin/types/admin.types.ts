import type { PaginationParams, AppointmentStatus, Money } from "@/types/global.types";

export interface PendingPsychologistItem {
  id: string;
  name: string;
  email?: string;
  credentials: Array<{ docUrl: string; type: string }>;
  submittedAt: string;
}

export interface VerifyPsychologistDto {
  decision: "approved" | "rejected";
  rejectionReason?: string;
}

export interface AdminAppointmentItem {
  id: string;
  patient: { id: string; name: string };
  psychologist: { id: string; name: string };
  status: AppointmentStatus;
  scheduledAt: string;
}

export interface AdminAppointmentParams extends PaginationParams {
  status?: AppointmentStatus;
}

export interface AdminReport {
  totalAppointments: number;
  totalRevenue: Money;
  newUsers: number;
  appointmentsByStatus: Record<string, number>;
  topSpecializations: Array<{ specialization: string; count: number }>;
}

export interface RefundDto {
  reason: string;
  amount?: number;
}