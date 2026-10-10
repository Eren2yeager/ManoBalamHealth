import { z } from "zod";
import { SESSION_NOTE_EMOTIONS } from "./session.model";

export const sessionNoteEntrySchema = z.object({
  id: z.string().min(1).max(64),
  text: z.string().min(1).max(2000),
  emotion: z.enum(SESSION_NOTE_EMOTIONS).optional(),
  atSeconds: z.number().int().nonnegative().optional(),
  createdAt: z.string().datetime().optional(),
});

export const updateSessionNotesSchema = z.object({
  entries: z.array(sessionNoteEntrySchema).max(200),
});
