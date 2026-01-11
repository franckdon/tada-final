"use server";

import { prisma } from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { authActionClient } from "../safe-action";
import { promptSystemOneQuestion } from "@/actions/missions/constant";
import { addQuestionTemplateAISchema } from "./schema";
import { SurveyQuestionSchema } from "../missions/schema";

export const addQuestionTemplateAIAction = authActionClient
  .schema(addQuestionTemplateAISchema)
  .metadata({
    name: "add-question-template-AI-action",
  })
  .action(
    async ({
      parsedInput: { templateId, userPrompt },
      ctx: { user, auth },
    }) => {
      try {
        const survey = await prisma.template.findUnique({
          where: { id: templateId },
          select: {
            questions: true,
          },
        });

        const { object } = await generateObject({
          model: openai("gpt-4o-mini"),
          schema: z.object({
            question: SurveyQuestionSchema,
          }),
          prompt: `user instructions: ${userPrompt}`,
          system: promptSystemOneQuestion,
        });

        console.log(object.question);

        if (!survey) throw new Error("Survey not found");

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const pages = (survey.questions as unknown as { pages: any[] }).pages;
        pages[0].elements.push(object.question);

        const updatedSurvey = await prisma.template.update({
          where: { id: templateId },
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
    }
  );
