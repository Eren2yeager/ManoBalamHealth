import { z } from "zod";

export const submitAssessmentSchema = z.object({
  templateType: z.enum(["anxiety", "stress", "depression"]),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedScore: z.number().int(),
    })
  ),
});
