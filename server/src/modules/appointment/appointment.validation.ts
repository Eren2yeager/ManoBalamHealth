import { z } from "zod";

// Auto mode schema
const createAppointmentAutoSchema = z.object({
  allocationMode: z.literal("auto"),
  preferredFrom: z.string().min(1).optional(),
  preferredTo: z.string().min(1).optional(),
  mode: z.union([z.literal("chat"), z.literal("audio"), z.literal("video")]),
  specialization: z.string().optional(),
  concernDescription: z.string().optional(),
}).refine(
  (data) => (!data.preferredFrom && !data.preferredTo) || Boolean(data.preferredFrom && data.preferredTo),
  { message: "preferredFrom and preferredTo must be provided together", path: ["preferredFrom"] },
);

// Emergency mode schema
const createAppointmentEmergencySchema = z.object({
  allocationMode: z.literal("emergency"),
  mode: z.union([z.literal("chat"), z.literal("audio"), z.literal("video")]).optional(),
  specialization: z.string().optional(),
  concernDescription: z.string().optional(),
});

// Discriminated union for create
export const createAppointmentSchema = z.discriminatedUnion("allocationMode", [
  createAppointmentAutoSchema,
  createAppointmentEmergencySchema,
]);

// Get my appointments query schema
export const getMyAppointmentsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z
    .union([
      z.literal("pending_payment"),
      z.literal("confirmed"),
      z.literal("in_progress"),
      z.literal("completed"),
      z.literal("cancelled"),
      z.literal("no_show"),
    ])
    .optional(),
  upcoming: z.coerce.boolean().optional(),
});

// Cancel appointment schema
export const cancelAppointmentSchema = z.object({
  reason: z.string().optional(),
});
