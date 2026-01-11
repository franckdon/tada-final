// lib/comments-service.ts
import { prisma } from "@/lib/prisma";

export async function createComment(input: {
  missionId?: string;
  surveyId?: string;
  surveyResponseId?: string;
  questionKey?: string;
  content: string;
  createdById: string;
}) {
  return prisma.comment.create({
    data: {
      missionId: input.missionId ?? null,
      surveyId: input.surveyId ?? null,
      surveyResponseId: input.surveyResponseId ?? null,
      questionKey: input.questionKey ?? null,
      content: input.content,
      createdById: input.createdById,
    },
  });
}
