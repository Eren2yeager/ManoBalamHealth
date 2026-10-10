import type { AppointmentStatus } from "@/types/global.types";

export const canCancelAppointment = (status: AppointmentStatus): boolean =>
  status === "pending_payment" || status === "confirmed";
