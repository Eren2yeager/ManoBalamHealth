import { z } from "zod";

export const createFeedbackSchema = z.object({
  appointmentId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  continueWithSamePsychologist: z.boolean().optional(),
});

export const getFeedbackListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
