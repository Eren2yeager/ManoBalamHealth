import { formatInViewerTz } from "@/lib/timezone";

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDate(date: string | Date): string {
  const dateStr = date instanceof Date ? date.toISOString() : date;
  return formatInViewerTz(dateStr, "dd MMM yyyy");
}

export function formatTime(date: string | Date): string {
  const dateStr = date instanceof Date ? date.toISOString() : date;
  return formatInViewerTz(dateStr, "hh:mm a");
}

export function formatDateTime(date: string | Date): string {
  const dateStr = date instanceof Date ? date.toISOString() : date;
  return formatInViewerTz(dateStr, "dd MMM yyyy, hh:mm a");
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);

  return parts.join(" ") || "0s";
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
