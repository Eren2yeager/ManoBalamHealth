/**
 * Licensed-country options for psychologist onboarding.
 * MUST match COUNTRIES in server/src/modules/psychologist/psychologist.constants.ts.
 */
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

export const COUNTRY_NAME: Record<string, string> = Object.fromEntries(
  COUNTRIES.map(({ code, name }) => [code, name]),
);
