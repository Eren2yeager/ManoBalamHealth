export interface CreateAppointmentManualRequest {
  allocationMode: "manual";
  slotId: string;
  mode: "chat" | "audio" | "video";
  concernDescription?: string;
}

export interface CreateAppointmentAutoRequest {
  allocationMode: "auto";
  preferredFrom: string;
  preferredTo: string;
  mode: "chat" | "audio" | "video";
  specialization?: string;
  concernDescription?: string;
}

export interface CreateAppointmentEmergencyRequest {
  allocationMode: "emergency";
  mode?: "chat" | "audio" | "video";
  specialization?: string;
  concernDescription?: string;
}

export type CreateAppointmentRequest = CreateAppointmentManualRequest | CreateAppointmentAutoRequest | CreateAppointmentEmergencyRequest;

export interface CreateAppointmentResponse {
  appointmentId: string;
  status: string;
  psychologistId: string;
  scheduledAt: string;
  mode: string;
  fee: { amount: number; currency: string };
}

export interface AppointmentListItemResponse {
  id: string;
  otherParty: { id: string; name: string; avatarUrl?: string };
  mode: string;
  status: string;
  scheduledAt: string;
  allocationMode: string;
}

export interface AppointmentDetailResponse {
  id: string;
  patient: { id: string; name: string; avatarUrl?: string };
  psychologist: { id: string; name: string; avatarUrl?: string };
  mode: string;
  status: string;
  scheduledAt: string;
  concernDescription?: string;
  allocationMode: string;
  payment: { status: string; amount: number; currency: string } | null;
}

export interface CancelAppointmentRequest {
  reason?: string;
}

export interface CancelAppointmentResponse {
  id: string;
  status: string;
}
