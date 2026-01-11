"use server";

import { prisma } from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { authActionClient } from "../safe-action";
import { promptSystemOneQuestion } from "./constant";
import { SurveyQuestionSchema, addQuestionAISchema } from "./schema";

export const addQuestionAIAction = authActionClient
  .schema(addQuestionAISchema)
  .metadata({
    name: "add-question-AI-action",
  })
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
      ctx: { user, auth },
    }) => {
      try {
        const survey = await prisma.survey.findUnique({
          where: { id: surveyId },
          select: {
            questions: true,
          },
        });

        const { object } = await generateObject({
          model: openai("gpt-4o-mini"),
          schema: z.object({
            question: SurveyQuestionSchema,
          }),
          prompt: `Problem: ${problemSummary}
                    Objective: ${objectives}
                    Hypotheses: ${assumptions}
                    audiences: ${audiences}
                    user instructions: ${userPrompt}`,
          system: promptSystemOneQuestion,
        });

        console.log(object.question);

        if (!survey) throw new Error("Survey not found");

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const pages = (survey.questions as unknown as { pages: any[] }).pages;
        pages[0].elements.push(object.question);

        const updatedSurvey = await prisma.survey.update({
          where: { id: surveyId },
          data: {
            questions: {
              ...(survey.questions as unknown as object),
              pages,
            },
          },
        });
        return { success: true, data: updatedSurvey };
      } catch (error) {
        console.error("[ADD_QUESTION_ERROR]", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Une erreur est survenue",
        };
      }
    },
  );
