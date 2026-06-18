import { z } from "zod";

export const updateSessionNotesSchema = z.object({
  notes: z.string().min(1),
});
