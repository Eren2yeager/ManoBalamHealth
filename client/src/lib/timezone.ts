import { DateTime } from "luxon";

export const getViewerTimezone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

// Backend always sends UTC ISO strings — convert to viewer's local timezone for display.
export const formatInViewerTz = (
  isoUtc: string,
  format: string = "ccc, dd LLL yyyy, h:mm a"
): string => {
  return DateTime.fromISO(isoUtc, { zone: "utc" })
    .setZone(getViewerTimezone())
    .toFormat(format);
};

// Converts a viewer-local datetime (e.g. from a date/time picker) back to UTC ISO for sending to backend.
export const localToUtcIso = (localDateTime: DateTime): string => {
  return localDateTime.toUTC().toISO()!;
};