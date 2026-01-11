"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authActionClient } from "../safe-action";
import { updateMissionSchema } from "./schema";

export const updateMissionAction = authActionClient
  .schema(updateMissionSchema)
  .metadata({ name: "update-mission-action" })
  .action(async ({ parsedInput }) => {
    const {
      missionId,
      problemSummary,
      objectives,
      assumptions,
      status,
      revalidateRoute,
    } = parsedInput;
    try {
      const mission = await prisma.mission.update({
        where: { id: missionId },
        data: { problemSummary, objectives, assumptions, status },
      });
      if (revalidateRoute) {
        revalidatePath(revalidateRoute);
      }
      return {
        success: true,
        mission,
      };
    } catch (error) {
      console.error("[UPDATE_MISSION_ERROR]", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  });
