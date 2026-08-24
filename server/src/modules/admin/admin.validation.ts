import { z } from "zod";

export const updatePsychologistStatusSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().trim().min(10).max(1000).optional(),
}).refine(
  (data) => data.decision !== "rejected" || !!data.rejectionReason,
  { message: "rejectionReason is required when decision is rejected", path: ["rejectionReason"] }
);

export const processRefundSchema = z.object({
  reason: z.string().min(1),
  amount: z.number().positive().optional(), // omit for full refund
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

export const getUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  role: z.enum(["patient", "psychologist"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export const updateUserActivitySchema = z.object({
  isActive: z.boolean(),
  reason: z.string().trim().min(10).max(1000),
});

export const getContactRequestsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  status: z.enum(["new", "in_progress", "resolved"]).optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export const updateContactRequestSchema = z.object({
  status: z.enum(["new", "in_progress", "resolved"]),
});

export const getAuditLogsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  action: z.string().trim().min(1).max(100).optional(),
});
