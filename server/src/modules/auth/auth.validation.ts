import { z } from "zod";
import { Roles } from "@/constants/roles.constant";

export const registerSchema = z
  .object({
    name: z.string().min(2).max(50).trim(),
    email: z.string().email().trim().optional(),
    phone: z.string().trim().optional(),
    password: z.string().min(8).refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
    }).refine((val) => /[0-9]/.test(val), {
      message: "Password must contain at least one number",
    }),
    role: z.enum([Roles.PATIENT, Roles.PSYCHOLOGIST]),
    country: z.string().min(1),
    timezone: z.string().min(1),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone is required",
    path: ["email"],
  });

export const verifyOtpSchema = z.object({
  userId: z.string().trim(),
  otp: z.string().length(6).trim(),
});

export const loginSchema = z.object({
  emailOrPhone: z.string().trim(),
  password: z.string(),
});
