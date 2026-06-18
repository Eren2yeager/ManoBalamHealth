import type {
  AllocationMode,
  AppointmentStatus,
  ConsultationMode,
  PaginationParams,
} from "@/types/global.types";

export interface AppointmentListItem {
  id: string;
  otherParty: { id: string; name: string; avatarUrl?: string };
  mode: ConsultationMode;
  status: AppointmentStatus;
  scheduledAt: string;
  allocationMode: AllocationMode;
}

export interface AppointmentDetail {
  id: string;
  patient: { id: string; name: string; avatarUrl?: string };
  psychologist: { id: string; name: string; avatarUrl?: string };
  mode: ConsultationMode;
  status: AppointmentStatus;
  scheduledAt: string;
  concernDescription?: string;
  allocationMode: AllocationMode;
  payment: { status: string; amount: number; currency: string } | null;
}

export interface AppointmentListParams extends PaginationParams {
  status?: AppointmentStatus;
  upcoming?: boolean;
}
