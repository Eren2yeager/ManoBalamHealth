import { z } from "zod";

export const setRulesSchema = z.object({
  rules: z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      slotDurationMinutes: z.union([z.literal(30), z.literal(45), z.literal(60)]),
      modes: z.array(z.union([z.literal("chat"), z.literal("audio"), z.literal("video")])).min(1),
    })
  ),
});

export const getSlotsSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  mode: z.union([z.literal("chat"), z.literal("audio"), z.literal("video")]).optional(),
});
