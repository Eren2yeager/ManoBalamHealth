/**
 * Source of truth for psychologist onboarding option lists and fee math.
 * The client mirrors these in client/src/features/psychologists/constants/
 * and can also fetch them live via GET /api/psychologists/meta.
 */

export const SPECIALIZATIONS = [
  "anxiety",
  "depression",
  "trauma",
  "relationships",
  "stress",
  "grief",
  "self-esteem",
  "sleep",
  "work-life-balance",
  "other",
] as const;

export type Specialization = (typeof SPECIALIZATIONS)[number];

export const LANGUAGES = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Bengali",
] as const;

export type Language = (typeof LANGUAGES)[number];

export const CREDENTIAL_TYPES = ["license", "degree", "id_proof"] as const;
export type CredentialType = (typeof CREDENTIAL_TYPES)[number];

/** ISO 3166-1 alpha-2 country codes with display names. */
export const COUNTRIES: ReadonlyArray<{ code: string; name: string }> = [
  { code: "AE", name: "United Arab Emirates" },
  { code: "AU", name: "Australia" },
  { code: "BD", name: "Bangladesh" },
  { code: "BT", name: "Bhutan" },
  { code: "CA", name: "Canada" },
  { code: "CH", name: "Switzerland" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "ID", name: "Indonesia" },
  { code: "IE", name: "Ireland" },
  { code: "IN", name: "India" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "KE", name: "Kenya" },
  { code: "LK", name: "Sri Lanka" },
  { code: "MV", name: "Maldives" },
  { code: "MY", name: "Malaysia" },
  { code: "NG", name: "Nigeria" },
  { code: "NL", name: "Netherlands" },
  { code: "NP", name: "Nepal" },
  { code: "NZ", name: "New Zealand" },
  { code: "OM", name: "Oman" },
  { code: "PH", name: "Philippines" },
  { code: "PK", name: "Pakistan" },
  { code: "QA", name: "Qatar" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SG", name: "Singapore" },
  { code: "TH", name: "Thailand" },
  { code: "US", name: "United States" },
  { code: "VN", name: "Vietnam" },
  { code: "ZA", name: "South Africa" },
];

export const COUNTRY_CODES: ReadonlySet<string> = new Set(COUNTRIES.map((c) => c.code));

export type SessionMode = "chat" | "audio" | "video";
export type SessionDuration = 30 | 45 | 60;

export const SESSION_DURATIONS: readonly SessionDuration[] = [30, 45, 60];
export const SESSION_MODES: readonly SessionMode[] = ["chat", "audio", "video"];

/**
 * The stored consultationFee.amount is the final admin-controlled session fee
 * in PAISE. Patients do not currently buy a separate duration/mode price
 * variant, so checkout must charge this exact amount.
 */
export const FEE_MULTIPLIERS = {
  mode: { video: 1, audio: 1, chat: 1 } as Record<SessionMode, number>,
  duration: { 30: 1, 45: 1, 60: 1 } as Record<SessionDuration, number>,
} as const;

/** Return the admin-controlled booked-session fee in paise. */
export function computeSessionFee(
  basePaise: number,
  mode: SessionMode,
  durationMinutes: number,
): number {
  void mode;
  void durationMinutes;
  return Math.max(0, Math.round(basePaise));
}

/** Full mode × duration display matrix in paise. Values currently match the admin-set fee. */
export function buildPriceMatrix(basePaise: number): Record<SessionMode, Record<SessionDuration, number>> {
  const matrix = {} as Record<SessionMode, Record<SessionDuration, number>>;
  for (const mode of SESSION_MODES) {
    matrix[mode] = {} as Record<SessionDuration, number>;
    for (const duration of SESSION_DURATIONS) {
      matrix[mode][duration] = computeSessionFee(basePaise, mode, duration);
    }
  }
  return matrix;
}
