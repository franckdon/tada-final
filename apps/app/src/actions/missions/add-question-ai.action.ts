// src/actions/missions/add-question-ai.action.ts
"use server";

import { prisma } from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { authActionClient } from "../safe-action";
import { promptSystemOneQuestion } from "./constant";
import { SurveyQuestionSchema, addQuestionAISchema } from "./schema";

import type { PlanCode } from "@/lib/plans/plan-limits";
import { resolveQuestionsLimit } from "@/lib/plans/resolve-questions-limit";

const PAGE_SIZE = 10;

function flattenPages(questionsJson: any): any[] {
  const pages = questionsJson?.pages;
  if (!Array.isArray(pages)) return [];
  return pages.flatMap((p: any) => (Array.isArray(p?.elements) ? p.elements : []));
}

function repaginate(allElements: any[]) {
  const pages: any[] = [];
  for (let i = 0; i < allElements.length; i += PAGE_SIZE) {
    pages.push({
      name: `page${pages.length + 1}`,
      elements: allElements.slice(i, i + PAGE_SIZE),
    });
  }
  return pages;
}

export const addQuestionAIAction = authActionClient
  .schema(addQuestionAISchema)
  .metadata({ name: "add-question-AI-action" })
  .action(
    async ({
      parsedInput: {
        problemSummary,
        objectives,
        assumptions,
        audiences,
        surveyId,
        userPrompt,
      },
    }) => {
      try {
        // ✅ Survey + Mission + Workspace plan
        const survey = await prisma.survey.findUnique({
          where: { id: surveyId },
          select: {
            id: true,
            questions: true,
            mission: {
              select: {
                workspace: {
                  select: {
                    workspacePlanSubscription: true,
                  },
                },
              },
            },
          },
        });

        if (!survey) throw new Error("Survey not found");

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

        const current = flattenPages(survey.questions);
        if (current.length >= questionsLimit) {
          return {
            success: false,
            error: `Quota atteint: ${current.length}/${questionsLimit} questions.`,
          };
        }

        // ✅ Generate 1 question
        const { object } = await generateObject({
          model: openai("gpt-4o-mini"),
          schema: z.object({ question: SurveyQuestionSchema }),
          prompt: `Problem: ${problemSummary}
Objectives: ${objectives}
Hypotheses: ${assumptions}
Audiences: ${JSON.stringify(audiences ?? {})}
User instructions: ${userPrompt}`,
          system: promptSystemOneQuestion,
        });

        // ✅ Append + repaginate
        const updatedElements = [...current, object.question];
        const pages = repaginate(updatedElements);

        const updatedSurvey = await prisma.survey.update({
          where: { id: surveyId },
          data: {
            questions: {
              ...(survey.questions as any),
              pages,
            },
          },
          select: { id: true, questions: true },
        });

        return { success: true, data: updatedSurvey };
      } catch (error) {
        console.error("[ADD_QUESTION_ERROR]", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Une erreur est survenue",
        };
      }
    },
  );
