import { DateTime } from "luxon";
import { IAvailabilityRule } from "@/modules/availability/availabilityRule.model";

/**
 * Generates time slots from availability rules
 * @param rules - Array of availability rules
 * @param timezone - Psychologist's timezone
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @returns Array of slots with UTC start/end times
 */
export const generateSlots = (
  rules: IAvailabilityRule[],
  timezone: string,
  startDate: string,
  endDate: string
) => {
  const slots: Array<{
    startTime: Date;
    endTime: Date;
    mode: "chat" | "audio" | "video";
  }> = [];

  const start = DateTime.fromISO(startDate).setZone(timezone);
  const end = DateTime.fromISO(endDate).setZone(timezone);

  for (let dt = start; dt <= end; dt = dt.plus({ days: 1 })) {
    const dayOfWeek = dt.weekday % 7; // Convert luxon's 1-7 to 0-6 (Sunday=0)
    const dayRules = rules.filter((r) => r.dayOfWeek === dayOfWeek && r.isActive);

    for (const rule of dayRules) {
      // Parse start and end times
      const [startHour, startMin] = rule.startTime.split(":").map(Number);
      const [endHour, endMin] = rule.endTime.split(":").map(Number);

      let currentTime = dt.set({ hour: startHour, minute: startMin, second: 0, millisecond: 0 });
      const ruleEndTime = dt.set({ hour: endHour, minute: endMin, second: 0, millisecond: 0 });

      // Generate slots
      while (currentTime.plus({ minutes: rule.slotDurationMinutes }) <= ruleEndTime) {
        const slotEnd = currentTime.plus({ minutes: rule.slotDurationMinutes });
        const slotStartUTC = currentTime.toUTC().toJSDate();
        const slotEndUTC = slotEnd.toUTC().toJSDate();

        for (const mode of rule.modes) {
          slots.push({
            startTime: slotStartUTC,
            endTime: slotEndUTC,
            mode,
          });
        }

        currentTime = slotEnd;
      }
    }
  }

  return slots;
};

export default generateSlots;
