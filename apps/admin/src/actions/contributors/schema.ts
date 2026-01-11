import { z } from "zod";

export const addCommentToSubmission = z.object({
  id: z.string(),
  comment: z.string().nullable().optional(),
  action: z.enum(["approved", "rejected", "pending"]),
  validatorId: z.string(),
  missionId: z.string(),
  surveyResponseId: z.string().min(1),
});
