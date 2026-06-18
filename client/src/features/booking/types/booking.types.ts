import type { ConsultationMode, Money } from "@/types/global.types";
import type { Specialization } from "@/features/psychologists/types/psychologist.types";

export type CreateAppointmentDto =
  | {
      allocationMode: "manual";
      slotId: string;
      mode: ConsultationMode;
      concernDescription?: string;
    }
  | {
      allocationMode: "auto";
      preferredFrom: string;
      preferredTo: string;
      mode: ConsultationMode;
      specialization?: Specialization;
      concernDescription?: string;
    };

export interface CreateAppointmentResponse {
  appointmentId: string;
  status: "pending_payment";
  psychologistId: string;
  scheduledAt: string;
  mode: ConsultationMode;
  fee: Money;
}
