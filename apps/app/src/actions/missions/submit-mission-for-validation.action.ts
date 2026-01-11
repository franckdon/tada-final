"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { revalidatePath } from "next/cache";
import { missionForValidationSchema } from "./schema";
import { getI18n } from "@/locales/server";

export const submitMissionForValidationAction = authActionClient
  .schema(missionForValidationSchema)
  .metadata({ name: "update-mission-action" })
  .action(async ({ parsedInput }) => {
    const t = await getI18n();

    const {
      missionId,
      name,
      problemSummary,
      objectives,
      assumptions,
      status,
      revalidateRoute,
      workspaceId,
      audiences,
    } = parsedInput;

    console.log("missionId", missionId);

    const existingMission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!existingMission) {
      throw new Error(t("missions.errors.notFound"));
    }

    try {
      const originalMission = await prisma.tempMission.findUnique({
        where: { missionId },
      });

      if (originalMission) {
        const lastModificationDate = new Date(originalMission.updatedAt);
        const currentDate = new Date();

        // Vérifier si nous sommes dans le même mois
        const isSameMonth =
          lastModificationDate.getFullYear() === currentDate.getFullYear() &&
          lastModificationDate.getMonth() === currentDate.getMonth();

        if (isSameMonth) {
          // Calculer les jours restants jusqu'au prochain mois
          const daysUntilNextMonth =
            new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              1
            ).getDate() - currentDate.getDate();

          return {
            success: true,
            message: t("missions.update.editTooSoon"),
          };
        }

        return {
          success: true,
          message: t("missions.update.alreadyPending"),
        };
      }

      const missionDuplication = await prisma.tempMission.create({
        data: {
          missionId,
          name,
          problemSummary,
          objectives,
          assumptions,
          audiences,
          status: status || existingMission.status,
          updatedType: existingMission.updatedType,
          type: existingMission.type,
          internal: existingMission.internal,
          isPublic: existingMission.isPublic,
          validationStatus: "pending",
        },
      });

      if (revalidateRoute) {
        revalidatePath(revalidateRoute);
      } else if (workspaceId) {
        revalidatePath(`/missions/${workspaceId}`);
      }

      return {
        success: true,
        duplicationId: missionDuplication.id,
        message: t("missions.update.submittedForReview"),
      };
    } catch (error) {
      console.error("[DUPLICATE_MISSION_ERROR]", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : t("missions.update.genericError"),
      };
    }
  });
