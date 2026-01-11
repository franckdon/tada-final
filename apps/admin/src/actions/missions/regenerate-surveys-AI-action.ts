"use server";

import { prisma } from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { authActionClient } from "../safe-action";
import { promptSystem } from "./constant";
import { SurveyQuestionSchema, regenerateSurveysAISchema } from "./schema";

export const regenerateSurveysAIAction = authActionClient
  .schema(regenerateSurveysAISchema)
  .metadata({
    name: "regenerate-surveys-AI-action",
  })
  .action(
    async ({
      parsedInput: {
        problemSummary,
        objectives,
        assumptions,
        audiences,
        surveyId,
      },
      ctx: { user, auth },
    }) => {
      try {
        const [survey, { object }] = await Promise.all([
          prisma.survey.findUnique({
            where: { id: surveyId },
            select: {
              questions: true,
            },
          }),
          generateObject({
            model: openai("gpt-4o-mini"),
            schema: z.object({
              questions: z.array(SurveyQuestionSchema),
            }),
            prompt: `Problem: ${problemSummary}
                    Objective: ${objectives}
                    Hypotheses: ${assumptions}
                    audiences: ${audiences}`,
            system: promptSystem,
          }),
        ]);

        console.log(object.questions);

        if (!survey) throw new Error("Survey not found");

        const updatedSurvey = await prisma.survey.update({
          where: { id: surveyId },
          data: {
            questions: {
              ...(survey.questions as unknown as object),
              pages: [
                {
                  name: "page1",
                  elements: object.questions,
                },
              ],
            },
          },
        });
        return { success: true, data: updatedSurvey };
      } catch (error) {
        console.error("[REGENERATE_SURVEYS_ERROR]", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Une erreur est survenue",
        };
      }
    },
  );
