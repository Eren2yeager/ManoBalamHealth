import { DateTime } from "luxon";

/**
 * Converts a date/time from a specific timezone to UTC
 * @param date - The date to convert (string or Date object)
 * @param timezone - The timezone of the input date (e.g. "Asia/Kolkata")
 * @returns ISO string in UTC
 */
export const toUTC = (date: string | Date, timezone: string): string => {
  return DateTime.fromJSDate(new Date(date), { zone: timezone }).toUTC().toISO() as string;
};

/**
 * Converts a UTC date/time to a specific timezone
 * @param date - The UTC date to convert (string or Date object)
 * @param timezone - The target timezone (e.g. "Asia/Kolkata")
 * @returns ISO string in the target timezone
 */
export const fromUTC = (date: string | Date, timezone: string): string => {
  return DateTime.fromJSDate(new Date(date)).setZone(timezone).toISO() as string;
};

/**
 * Formats a date in a specific timezone
 * @param date - The date to format
 * @param timezone - The timezone to format in
 * @param format - The format string (using Luxon tokens)
 * @returns Formatted date string
 */
export const formatInTimezone = (
  date: string | Date,
  timezone: string,
  format: string = "yyyy-MM-dd HH:mm:ss"
): string => {
  return DateTime.fromJSDate(new Date(date)).setZone(timezone).toFormat(format);
};

export default {
  toUTC,
  fromUTC,
  formatInTimezone,
};
