"use server";

import { prisma } from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { authActionClient } from "../safe-action";
import { promptSystem } from "./constant";
import { SurveyQuestionSchema, createMissionSchema } from "./schema";

export const createMissionAction = authActionClient
  .schema(createMissionSchema)
  .metadata({
    name: "create-mission-action",
  })
  .action(
    async ({
      parsedInput: {
        templateId,
        name,
        problemSummary,
        objectives,
        assumptions,
        audiences,
        mode,
      },
      ctx: { user, auth },
    }) => {
      let template = null;
      let surveyQuestions = null;

      try {
        const mission = await prisma.mission.create({
          data: {
            name,
            problemSummary,
            objectives,
            assumptions,
            status: "draft",
            audiences,
            internal: true,
            type: mode === "contributor-info" ? "contributor" : "survey",
          },
        });

        if (mode && mode !== "manual") {
          if (templateId) {
            template = await prisma.template.findUnique({
              where: { id: templateId },
              include: { organization: true },
            });

            if (!template) {
              return {
                success: false,
                data: null,
                message: "Template not found",
              };
            }

            surveyQuestions = template.questions;
          } else {
            const { object } = await generateObject({
              model: openai("gpt-4o-mini"),
              schema: z.object({
                questions: z.array(SurveyQuestionSchema),
              }),
              prompt: `Problem: ${problemSummary}
                  Objective: ${objectives}
                  Hypotheses: ${assumptions}
                  audiences: ${audiences}`,
              system: promptSystem,
            });

            surveyQuestions = {
              title: name,
              description: "",
              pages: [
                {
                  name: "page1",
                  elements: object.questions,
                },
              ],
            };
          }

          await prisma.survey.create({
            data: {
              name,
              missionId: mission.id,
              questions: surveyQuestions as any,
              description: "Survey description",
            },
          });
        }
        return { success: true, data: mission, message: "success" };
      } catch (error) {
        console.error("[CREATE_MISSION_ERROR]", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Une erreur est survenue",
        };
      }
    }
  );
