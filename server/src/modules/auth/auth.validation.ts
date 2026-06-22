import { z } from "zod";
import { Roles } from "@/constants/roles.constant";

export const registerSchema = z
  .object({
    name: z.string().min(2).max(50).trim(),
    email: z.string().email().trim(),
    phone: z.string().trim().optional(),
    password: z.string().min(8).refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
    }).refine((val) => /[0-9]/.test(val), {
      message: "Password must contain at least one number",
    }),
    role: z.enum([Roles.PATIENT, Roles.PSYCHOLOGIST]),
    country: z.string().min(1),
    timezone: z.string().min(1),
  });

export const verifyOtpSchema = z.object({
  userId: z.string().trim(),
  otp: z.string().length(6).trim(),
});

export const loginSchema = z.object({
  emailOrPhone: z.string().trim(),
  password: z.string(),
});

export const resendOtpSchema = z.object({
  userId: z.string().trim().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8).refine((value) => /[A-Z]/.test(value), {
    message: "Password must contain at least one uppercase letter",
  }).refine((value) => /[0-9]/.test(value), {
    message: "Password must contain at least one number",
  }),
});
