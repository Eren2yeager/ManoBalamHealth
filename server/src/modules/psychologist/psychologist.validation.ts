import { z } from "zod";
import {
  SPECIALIZATIONS,
  LANGUAGES,
  CREDENTIAL_TYPES,
  COUNTRY_CODES,
} from "./psychologist.constants";

export const updatePsychologistProfileSchema = z.object({
  specialization: z
    .array(z.enum(SPECIALIZATIONS as unknown as [string, ...string[]]))
    .min(1)
    .max(12)
    .optional(),
  languages: z
    .array(z.enum(LANGUAGES as unknown as [string, ...string[]]))
    .min(1)
    .max(12)
    .optional(),
  experienceYears: z.number().int().min(0).max(70).optional(),
  // consultationFee removed - now managed by admin only
  bio: z.string().trim().min(50).max(3000).optional(),
  licensedCountries: z
    .array(
      z
        .string()
        .trim()
        .regex(/^[A-Z]{2}$/)
        .refine((code) => COUNTRY_CODES.has(code), { message: "Unsupported country code" }),
    )
    .min(1)
    .max(30)
    .optional(),
  isAcceptingEmergency: z.boolean().optional(),
});

export const getPsychologistsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  specialization: z.string().optional(),
  language: z.string().optional(),
  country: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sortBy: z.enum(["rating", "experience", "fee_asc", "fee_desc"]).default("rating"),
});

export const uploadCredentialsSchema = z.object({
  type: z.enum(CREDENTIAL_TYPES as unknown as [string, ...string[]]),
});

export const deleteCredentialParamsSchema = z.object({
  credentialId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid credential id"),
});

// Admin-only fee validation
export const setPsychologistFeeSchema = z.object({
  amount: z.number().int().min(5000).max(10_000_000), // Base fee in paise (₹50 – ₹1,00,000)
  currency: z.string().trim().length(3).default("INR"),
  reason: z.string().trim().max(500).optional(),
});
