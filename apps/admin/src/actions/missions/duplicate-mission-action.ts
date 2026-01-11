"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authActionClient } from "../safe-action";
import { revalidatePath } from "next/cache";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { duplicateMissionSchema, SurveyQuestionSchema } from "./schema";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { promptSystem } from "./constant";

export const duplicateMissionAction = authActionClient
  .schema(duplicateMissionSchema)
  .metadata({ name: "duplicate-mission-action" })
  .action(async ({ parsedInput: { missionId }, ctx: { user } }) => {
    try {
      const originalMission = await prisma.mission.findUnique({
        where: { id: missionId },
        include: {
          subDashboard: {
            include: {
              SubDashboardItem: true,
            },
          },
        },
      });

      if (!originalMission) {
        throw new Error("Erreur lors de la récupération de la mission");
      }

      const duplicatedMission = await prisma.mission.create({
        data: {
          name: `${originalMission?.name} - duplicated`,
          problemSummary: originalMission.problemSummary,
          objectives: originalMission.objectives,
          assumptions: originalMission.assumptions,
          organizationId: originalMission.organizationId,
          status: "draft",
          audiences: originalMission.audiences as any,
        },
      });

      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: z.object({
          questions: z.array(SurveyQuestionSchema),
        }),
        prompt: `Problem: ${originalMission.problemSummary}
                  Objective: ${originalMission.objectives}
                  Hypotheses: ${originalMission.assumptions}
                  audiences: ${originalMission.audiences}`,
        system: promptSystem,
      });

      await prisma.survey.create({
        data: {
          name: originalMission.name,
          missionId: duplicatedMission.id,
          questions: {
            title: originalMission.problemSummary,
            description: "",
            pages: [
              {
                name: "page1",
                elements: object.questions,
              },
            ],
          },
          description: "Survey description",
        },
      });

      for (const subDashboard of originalMission.subDashboard) {
        const duplicatedSubDashboard = await prisma.subDashboard.create({
          data: {
            missionId: duplicatedMission.id,
            name: subDashboard.name,
            isShared: subDashboard.isShared,
            userId: user.id,
          },
        });

        for (const item of subDashboard.SubDashboardItem) {
          await prisma.subDashboardItem.create({
            data: {
              subDashboardId: duplicatedSubDashboard.id,
              type: item.type,
              content: item.content,
              surveyKey: item.surveyKey,
              imageUrl: item.imageUrl,
            },
          });
        }
      }

      revalidatePath(`/missions/${originalMission?.organizationId}`);

      return {
        success: true,
        duplicationId: duplicatedMission.id,
        message: "Mission dupliquée",
      };
    } catch (error) {
      console.error("[DUPLICATE_MISSION_ERROR]", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la duplication",
      };
    }
  });
