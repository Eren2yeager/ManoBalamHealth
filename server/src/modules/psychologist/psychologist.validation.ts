import { z } from "zod";

export const updatePsychologistProfileSchema = z.object({
  specialization: z.array(z.string().trim().min(2).max(80)).min(1).max(12).optional(),
  languages: z.array(z.string().trim().min(2).max(50)).min(1).max(12).optional(),
  experienceYears: z.number().int().min(0).max(70).optional(),
  consultationFee: z.object({
    amount: z.number().positive().max(1_000_000),
    currency: z.string().trim().length(3),
  }).optional(),
  bio: z.string().trim().min(50).max(3000).optional(),
  licensedCountries: z.array(z.string().trim().regex(/^[A-Z]{2}$/)).min(1).max(30).optional(),
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
  type: z.enum(["license", "degree", "id_proof"]),
});
