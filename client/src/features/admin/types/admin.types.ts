import type { PaginationParams, AppointmentStatus } from "@/types/global.types";

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
  completedAppointments: number;
  totalRevenue: number;
  totalPsychologists: number;
  totalPatients: number;
}

export interface RefundDto {
  reason: string;
  amount?: number;
}
