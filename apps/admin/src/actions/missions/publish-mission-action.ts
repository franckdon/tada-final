"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { publishMissionSchema } from "./schema";

export const publishMissionAction = authActionClient
  .schema(publishMissionSchema)
  .metadata({
    name: "publish-mission-action",
  })
  .action(async ({ parsedInput }) => {
    try {
      const { missionId, isPublish, status } = parsedInput;
      const mission = await prisma.mission.update({
        where: { id: missionId },
        data: {
          isPublish: isPublish,
          publishAt: new Date(),
          status,
        },
      });

      return mission;
    } catch (error) {
      console.error("[PUBLISH_MISSION_ERROR]", error);
      return {
        success: false,
      };
    }
  });
