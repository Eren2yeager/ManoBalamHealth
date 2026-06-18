import { z } from "zod";

export const updatePsychologistProfileSchema = z.object({
  specialization: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  experienceYears: z.number().min(0).optional(),
  consultationFee: z.object({
    amount: z.number().min(0),
    currency: z.string(),
  }).optional(),
  bio: z.string().optional(),
  licensedCountries: z.array(z.string()).optional(),
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
