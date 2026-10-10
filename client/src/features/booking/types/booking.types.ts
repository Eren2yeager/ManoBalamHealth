import type { ConsultationMode, Money } from "@/types/global.types";

export type CreateAppointmentDto =
  {
    allocationMode: "auto";
    preferredFrom?: string;
    preferredTo?: string;
    mode: ConsultationMode;
    specialization?: string;
    concernDescription?: string;
  };

export interface BookingSettings {
  showScheduleSelection: boolean;
}

export interface CreateAppointmentResponse {
  appointmentId: string;
  status: "pending_payment";
  psychologistId: string;
  scheduledAt: string;
  mode: ConsultationMode;
  fee: Money;
}
