"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authActionClient } from "../safe-action";
import { revalidatePath } from "next/cache";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { duplicateMissionSchema } from "./schema";

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
        return { success: false, error: "Mission non trouvée" };
      }

      const lastModification =
        originalMission.updatedAt || originalMission.createdAt;

      const daysSinceLastModification = Math.floor(
        (Date.now() - new Date(lastModification).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastModification < 30) {
        throw new Error(
          `Duplication impossible. Attendre encore ${
            30 - daysSinceLastModification
          } jours.`,
          {
            cause:
              "Vous ne pouvez modifier la mission qu'une fois tous les 30 jours",
          }
        );
      }

      const tempMission = await prisma.tempMission.create({
        data: {
          missionId: missionId,
          name: originalMission.name,
          problemSummary: originalMission.problemSummary,
          objectives: originalMission.objectives,
          assumptions: originalMission.assumptions,
          audiences: originalMission.audiences as any,
          status: originalMission.status,
          updatedType: originalMission.updatedType,
          type: originalMission.type,
          internal: originalMission.internal,
          isPublic: originalMission.isPublic,
          validationStatus: "pending",
        },
      });

      console.log("tempMission", tempMission);

      for (const subDashboard of originalMission.subDashboard) {
        const tempSubDashboard = await prisma.tempSubDashboard.create({
          data: {
            tempMissionId: tempMission.id,
            name: subDashboard.name,
            isShared: subDashboard.isShared,
          },
        });

        for (const item of subDashboard.SubDashboardItem) {
          await prisma.tempSubDashboardItem.create({
            data: {
              tempSubDashboardId: tempSubDashboard.id,
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
        duplicationId: tempMission.id,
        message: "Mission dupliquée et soumise pour validation",
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
