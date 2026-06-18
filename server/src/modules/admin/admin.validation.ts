import { z } from "zod";

export const updatePsychologistStatusSchema = z.object({
  status: z.union([z.literal("approved"), z.literal("rejected")]),
  rejectionReason: z.string().optional(),
});

export const processRefundSchema = z.object({
  reason: z.string().min(1),
});

export const getPsychologistsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.union([z.literal("pending"), z.literal("approved"), z.literal("rejected")]).optional(),
});

export const getAppointmentsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z
    .union([
      z.literal("pending_payment"),
      z.literal("confirmed"),
      z.literal("in_progress"),
      z.literal("completed"),
      z.literal("cancelled"),
      z.literal("refunded"),
      z.literal("no_show"),
    ])
    .optional(),
});
