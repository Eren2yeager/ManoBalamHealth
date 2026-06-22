import { z } from "zod";

export const createContactRequestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(3000),
  consent: z.literal(true),
});

