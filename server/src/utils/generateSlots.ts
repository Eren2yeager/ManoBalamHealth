import { DateTime } from "luxon";
import { IAvailabilityRule } from "@/modules/availability/availabilityRule.model";

/**
 * Generates time slots from availability rules.
 *
 * dayOfWeek convention (matches JS Date.getDay() and the plan):
 *   0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday,
 *   4 = Thursday, 5 = Friday, 6 = Saturday
 *
 * Luxon .weekday:  1=Mon … 6=Sat, 7=Sun
 * Conversion:      luxonWeekday % 7  →  Mon=1 … Sat=6, Sun=0  ✓
 *
 * @param rules     Availability rules for the psychologist
 * @param timezone  Psychologist's IANA timezone (e.g. "Asia/Kolkata")
 * @param startDate Start of the range — ISO date or datetime string
 * @param endDate   End of the range   — ISO date or datetime string
 */
export const generateSlots = (
  rules: IAvailabilityRule[],
  timezone: string,
  startDate: string,
  endDate: string
): Array<{ startTime: Date; endTime: Date; mode: "chat" | "audio" | "video" }> => {
  const slots: Array<{ startTime: Date; endTime: Date; mode: "chat" | "audio" | "video" }> = [];

  // Anchor both boundaries to the START of their respective days in the
  // psychologist's timezone so "2026-06-19" always means 00:00 local time,
  // not an ambiguous UTC midnight shifted by timezone offset.
  const start = DateTime.fromISO(startDate, { zone: timezone }).startOf("day");
  const end   = DateTime.fromISO(endDate,   { zone: timezone }).startOf("day");

  if (!start.isValid || !end.isValid) {
    throw new Error(`Invalid date range: startDate="${startDate}", endDate="${endDate}"`);
  }

  for (let dt = start; dt <= end; dt = dt.plus({ days: 1 })) {
    // Luxon weekday: 1=Mon … 7=Sun  →  % 7 gives Mon=1 … Sat=6, Sun=0
    const dayOfWeek = dt.weekday % 7;
    const dayRules = rules.filter((r) => r.dayOfWeek === dayOfWeek && r.isActive);

    for (const rule of dayRules) {
      const [startHour, startMin] = rule.startTime.split(":").map(Number);
      const [endHour, endMin]     = rule.endTime.split(":").map(Number);

      let cursor    = dt.set({ hour: startHour, minute: startMin, second: 0, millisecond: 0 });
      const ruleEnd = dt.set({ hour: endHour,   minute: endMin,   second: 0, millisecond: 0 });

      while (cursor.plus({ minutes: rule.slotDurationMinutes }) <= ruleEnd) {
        const slotEnd = cursor.plus({ minutes: rule.slotDurationMinutes });

        for (const mode of rule.modes) {
          slots.push({
            startTime: cursor.toUTC().toJSDate(),
            endTime:   slotEnd.toUTC().toJSDate(),
            mode,
          });
        }

        cursor = slotEnd;
      }
    }
  }

  return slots;
};

export default generateSlots;
