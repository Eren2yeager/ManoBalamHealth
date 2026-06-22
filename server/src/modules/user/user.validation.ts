import { z } from "zod";

const isValidTimezone = (timezone: string) => {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, "Use an international number such as +919876543210");

export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  age: z.number().min(13).max(120).nullable().optional(),
  gender: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .nullable()
    .optional(),
  emergencyContact: z
    .object({
      name: z.string().min(2).max(100).trim(),
      phone: phoneSchema,
    })
    .nullable()
    .optional(),
  timezone: z
    .string()
    .min(1)
    .refine(isValidTimezone, "Invalid IANA timezone")
    .optional(),
});
