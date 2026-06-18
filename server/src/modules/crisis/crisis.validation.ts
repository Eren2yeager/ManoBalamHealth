import { z } from "zod";

export const getCrisisResourcesSchema = z.object({
  jurisdiction: z.string().optional(),
});
