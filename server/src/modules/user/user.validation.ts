import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  age: z.number().min(13).max(120).optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  emergencyContact: z.object({
    name: z.string().min(1).max(100).trim(),
    phone: z.string().min(1).trim(),
  }).optional(),
  timezone: z.string().min(1).optional(),
});
