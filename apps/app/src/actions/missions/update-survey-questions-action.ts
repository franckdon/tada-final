// src/actions/missions/update-survey-questions-action.ts
"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { updateSurveyQuestionsSchema } from "./schema";
import type { PlanCode } from "@/lib/plans/plan-limits";
import { resolveQuestionsLimit } from "@/lib/plans/resolve-questions-limit";

function countIncoming(questionsJson: any): number {
  const pages = questionsJson?.pages;
  
  if (!Array.isArray(pages)) return 0;
  return pages.reduce((sum: number, p: any) => sum + (Array.isArray(p?.elements) ? p.elements.length : 0), 0);
}

export const updateSurveyQuestionsAction = authActionClient
  .schema(updateSurveyQuestionsSchema)
  .metadata({ name: "update-survey-questions-action" })
  .action(async ({ parsedInput: { surveyId, questions } }) => {
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      select: {
        id: true,
        mission: {
          select: {
            workspace: { select: { workspacePlanSubscription: true } },
          },
        },
      },
    });
    if (!survey) return { success: false, error: "Survey not found" };

    const planCode = (survey.mission?.workspace?.workspacePlanSubscription?.planCode ??
      "starter") as PlanCode;

    const overrideQ =
      (survey.mission?.workspace?.workspacePlanSubscription as any)?.overrides?.questionsPerSurvey ??
      null;

    const questionsLimit = resolveQuestionsLimit({
      planCode,
      overrideQuestionsPerSurvey: overrideQ,
      fallback: 10,
    });

    const total = countIncoming(questions);
    if (total > questionsLimit) {
      return {
        success: false,
        error: `Quota dépassé: ${total}/${questionsLimit} questions. Supprime des questions avant d’enregistrer.`,
      };
    }

    const updated = await prisma.survey.update({
      where: { id: surveyId },
      data: { questions },
      select: { id: true, questions: true },
    });

    return { success: true, data: updated };
  });
