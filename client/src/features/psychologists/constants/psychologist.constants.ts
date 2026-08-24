import type { ModalityFilter } from "../store/psychologistFilterStore";

/**
 * All specialization options with their display labels, in a stable order.
 * This is the single source of truth — the Specialization type is derived from
 * these values so the type is always in sync with the data.
 */
export const SPECIALIZATIONS = [
  { value: "anxiety",           label: "Anxiety" },
  { value: "depression",        label: "Depression" },
  { value: "trauma",            label: "Trauma" },
  { value: "relationships",     label: "Relationships" },
  { value: "stress",            label: "Stress Management" },
  { value: "grief",             label: "Grief" },
  { value: "self-esteem",       label: "Self-Esteem" },
  { value: "sleep",             label: "Sleep" },
  { value: "work-life-balance", label: "Work-Life Balance" },
  { value: "other",             label: "Other" },
] as const;

/** Union type derived from the constant — no duplication, always in sync. */
export type Specialization = (typeof SPECIALIZATIONS)[number]["value"];

/**
 * Lookup map for fast label resolution from a Specialization value.
 * Use wherever you need a human-readable label from a raw value.
 */
export const SPECIALIZATION_LABEL: Record<Specialization, string> = Object.fromEntries(
  SPECIALIZATIONS.map(({ value, label }) => [value, label])
) as Record<Specialization, string>;

/** Supported consultation languages. */
export const LANGUAGES: string[] = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Bengali",
];

/**
 * Fee multipliers — MUST match server/src/modules/psychologist/psychologist.constants.ts.
 * The stored consultationFee.amount is the final admin-controlled session fee in paise.
 */
export const FEE_MULTIPLIERS = {
  mode: { video: 1, audio: 1, chat: 1 } as Record<"video" | "audio" | "chat", number>,
  duration: { 30: 1, 45: 1, 60: 1 } as Record<30 | 45 | 60, number>,
} as const;

export const SESSION_MODES = ["chat", "audio", "video"] as const;
export const SESSION_DURATIONS = [30, 45, 60] as const;

export type SessionMode = (typeof SESSION_MODES)[number];
export type SessionDuration = (typeof SESSION_DURATIONS)[number];

/** Return the admin-controlled booked-session fee in paise. */
export function computeSessionFee(
  basePaise: number,
  mode: SessionMode,
  durationMinutes: SessionDuration,
): number {
  void mode;
  void durationMinutes;
  return Math.max(0, Math.round(basePaise));
}

/** Session modality options for the filter UI. */
export const MODALITIES: { value: ModalityFilter; label: string }[] = [
  { value: "any",   label: "Any" },
  { value: "video", label: "Video Call" },
  { value: "audio", label: "Voice Call" },
];
