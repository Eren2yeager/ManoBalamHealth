import type { ConsultationMode, AppointmentStatus, AllocationMode, PaginationParams } from "@/types/global.types";

export interface AppointmentListItem {
  id: string;
  otherParty: { id: string; name: string; avatarUrl?: string };
  mode: ConsultationMode;
  status: AppointmentStatus;
  scheduledAt: string;
  scheduledEndsAt: string;
  sessionAccessStartsAt: string;
  purchasedDurationSeconds: number;
  allocationMode: AllocationMode;
  hasFeedback: boolean;
  feedback?: {
    rating: number;
    comment?: string;
    createdAt: string;
  };
}

export interface AppointmentDetail {
  id: string;
  patient: { id: string; name: string; avatarUrl?: string };
  psychologist: { id: string; name: string; avatarUrl?: string };
  mode: ConsultationMode;
  status: AppointmentStatus;
  scheduledAt: string;
  scheduledEndsAt: string;
  sessionAccessStartsAt: string;
  purchasedDurationSeconds: number;
  concernDescription?: string;
  allocationMode: AllocationMode;
  payment: { status: string; amount: number; currency: string } | null;
  hasFeedback: boolean;
  feedback?: {
    rating: number;
    comment?: string;
    createdAt: string;
  };
}

export interface AppointmentListParams extends PaginationParams {
  status?: AppointmentStatus;
  upcoming?: boolean;
}
