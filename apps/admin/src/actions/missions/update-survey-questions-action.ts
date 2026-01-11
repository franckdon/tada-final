"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { updateSurveyQuestionsSchema } from "./schema";

export const updateSurveyQuestionsAction = authActionClient
  .schema(updateSurveyQuestionsSchema)
  .metadata({
    name: "update-survey-questions-action",
  })
  .action(async ({ parsedInput }) => {
    try {
      const { surveyId, questions } = parsedInput;
      await prisma.survey.update({
        where: { id: surveyId },
        data: {
          questions: questions,
        },
      });
    } catch (error) {
      console.error("[UPDATE_SURVEY_QUESTIONS_ERROR]", error);
      return {
        success: false,
      };
    }
  });
