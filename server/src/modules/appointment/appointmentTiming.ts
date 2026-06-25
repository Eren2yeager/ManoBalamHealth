import { AvailabilitySlotModel } from "@/modules/availability/availabilitySlot.model";

export const DEFAULT_PURCHASED_DURATION_SECONDS = 30 * 60;
export const SESSION_ACCESS_LEAD_SECONDS = 5 * 60;

export const getScheduledEndsAt = (
  scheduledAt: Date,
  purchasedDurationSeconds: number,
) => new Date(scheduledAt.getTime() + purchasedDurationSeconds * 1000);

export const getSessionAccessStartsAt = (scheduledAt: Date) =>
  new Date(scheduledAt.getTime() - SESSION_ACCESS_LEAD_SECONDS * 1000);

export const isWithinSessionAccessWindow = (args: {
  scheduledAt: Date;
  purchasedDurationSeconds: number;
  now?: Date;
}) => {
  const now = args.now ?? new Date();
  const accessStartsAt = getSessionAccessStartsAt(args.scheduledAt);
  const scheduledEndsAt = getScheduledEndsAt(
    args.scheduledAt,
    args.purchasedDurationSeconds,
  );

  return now >= accessStartsAt && now < scheduledEndsAt;
};

export const resolveAppointmentTiming = async (appointment: {
  scheduledAt: Date;
  slotId?: any;
}) => {
  let purchasedDurationSeconds = DEFAULT_PURCHASED_DURATION_SECONDS;

  if (appointment.slotId) {
    const slot = await AvailabilitySlotModel.findById(appointment.slotId);
    if (slot) {
      purchasedDurationSeconds = Math.max(
        60,
        Math.floor((slot.endTime.getTime() - slot.startTime.getTime()) / 1000),
      );
    }
  }

  const scheduledEndsAt = getScheduledEndsAt(
    appointment.scheduledAt,
    purchasedDurationSeconds,
  );
  const sessionAccessStartsAt = getSessionAccessStartsAt(appointment.scheduledAt);

  return {
    purchasedDurationSeconds,
    scheduledEndsAt,
    sessionAccessStartsAt,
  };
};
