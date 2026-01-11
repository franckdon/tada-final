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
      organizationId,
      audiences,
    } = parsedInput;

    const existingMission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!existingMission) {
      throw new Error(t("missions.errors.notFound"));
    }

    try {
      const updatedMission = await prisma.mission.update({
        where: { id: missionId },
        data: {
          name,
          problemSummary,
          objectives,
          assumptions,
          audiences,
          status: status || existingMission.status,
          organizationId,
          updatedType: "admin", // ou autre valeur si besoin
        },
      });

      revalidatePath(`/missions/${missionId}`);

      return {
        success: true,
        message: t("missions.update.successDirect"),
        updated: updatedMission,
      };
    } catch (error) {
      console.error("[UPDATE_MISSION_ERROR]", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : t("missions.update.genericError"),
      };
    }
  });
