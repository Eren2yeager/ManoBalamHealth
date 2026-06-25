import { DateTime } from "luxon";
import type { AppointmentDetail, AppointmentListItem } from "../types/appointment.types";

type AppointmentForAccess = Pick<
  AppointmentListItem | AppointmentDetail,
  "status" | "scheduledAt" | "scheduledEndsAt" | "sessionAccessStartsAt"
>;

export const getSessionAccessState = (appointment: AppointmentForAccess) => {
  const now = DateTime.now();
  const accessStartsAt = DateTime.fromISO(appointment.sessionAccessStartsAt);
  const scheduledAt = DateTime.fromISO(appointment.scheduledAt);
  const accessEndsAt = DateTime.fromISO(appointment.scheduledEndsAt);
  const isCompleted = appointment.status === "completed";
  const isTerminal = ["completed", "cancelled", "no_show"].includes(appointment.status);
  const isTooEarly = now < accessStartsAt;
  const isExpired = now >= accessEndsAt;
  const canJoinByStatus =
    appointment.status === "confirmed" || appointment.status === "in_progress";
  const canJoinSession = canJoinByStatus && !isTooEarly && !isExpired && !isCompleted;

  return {
    canJoinSession,
    isTooEarly,
    isExpired,
    isTerminal,
    accessStartsAt,
    scheduledAt,
    accessEndsAt,
  };
};
