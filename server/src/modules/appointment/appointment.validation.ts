import { z } from "zod";

// Manual mode schema
const createAppointmentManualSchema = z.object({
  allocationMode: z.literal("manual"),
  slotId: z.string().min(1),
  mode: z.union([z.literal("chat"), z.literal("audio"), z.literal("video")]),
  concernDescription: z.string().optional(),
});

// Auto mode schema
const createAppointmentAutoSchema = z.object({
  allocationMode: z.literal("auto"),
  preferredFrom: z.string().min(1),
  preferredTo: z.string().min(1),
  mode: z.union([z.literal("chat"), z.literal("audio"), z.literal("video")]),
  specialization: z.string().optional(),
  concernDescription: z.string().optional(),
});

// Emergency mode schema
const createAppointmentEmergencySchema = z.object({
  allocationMode: z.literal("emergency"),
  mode: z.union([z.literal("chat"), z.literal("audio"), z.literal("video")]).optional(),
  specialization: z.string().optional(),
  concernDescription: z.string().optional(),
});

// Discriminated union for create
export const createAppointmentSchema = z.discriminatedUnion("allocationMode", [
  createAppointmentManualSchema,
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
