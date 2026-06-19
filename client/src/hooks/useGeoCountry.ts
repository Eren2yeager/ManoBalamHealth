// src/hooks/useGeoCountry.ts

import { useState } from "react";
import countriesLib from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import ct from "countries-and-timezones";
import { getViewerTimezone } from "@/lib/timezone";

countriesLib.registerLocale(enLocale);

export interface CountryOption {
  code: string;   // ISO 3166-1 alpha-2, e.g. "IN" — what the backend accepts
  name: string;   // display name, e.g. "India"
}

export interface UseGeoCountryReturn {
  allCountries: CountryOption[];
  detectedCountryCode: string | null;
  detectedTimezone: string;
  getTimezonesForCountry: (countryCode: string) => string[];
}

// Derives the most likely ISO country code from an IANA timezone string.
// e.g. "Asia/Kolkata" -> "IN", "America/New_York" -> "US"
// Returns null if the timezone maps to multiple countries (ambiguous)
// or is unrecognised — caller should fall back to showing the country picker
// without a pre-selection rather than guessing wrong.
const inferCountryFromTimezone = (tz: string): string | null => {
  try {
    const tzData = ct.getTimezone(tz);
    if (!tzData || tzData.countries.length === 0) return null;
    // Only auto-select if unambiguous (exactly one country for this tz)
    if (tzData.countries.length === 1) return tzData.countries[0];
    return null;
  } catch {
    return null;
  }
};

export const useGeoCountry = (): UseGeoCountryReturn => {
  const detectedTimezone = getViewerTimezone();

  const [detectedCountryCode] = useState<string | null>(() =>
    inferCountryFromTimezone(detectedTimezone)
  );

  // Build full sorted country list once — stable across renders
  const [allCountries] = useState<CountryOption[]>(() => {
    const raw = countriesLib.getNames("en", { select: "official" });
    return Object.entries(raw)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  // Returns IANA timezone strings valid for a given ISO country code.
  // Used to populate the timezone picker after the user selects a country.
  const getTimezonesForCountry = (countryCode: string): string[] => {
    try {
      const country = ct.getCountry(countryCode);
      return country?.timezones ?? [];
    } catch {
      return [];
    }
  };

  return {
    allCountries,
    detectedCountryCode,
    detectedTimezone,
    getTimezonesForCountry,
  };
};