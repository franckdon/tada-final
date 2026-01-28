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

    const existingMission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!existingMission) {
      throw new Error(t("missions.errors.notFound"));
    }

    try {
      const existingTemp = await prisma.tempMission.findUnique({
        where: { missionId },
      });

      if (existingTemp) {
        const updated = await prisma.tempMission.update({
          where: { missionId },
          data: {
            name,
            problemSummary,
            objectives,
            assumptions,
            audiences,
            status: status || existingMission.status,
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
          duplicationId: updated.id,
          message: t("missions.update.alreadyPending"),
        };
      }

      const created = await prisma.tempMission.create({
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
        duplicationId: created.id,
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
