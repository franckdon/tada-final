"use server";

import { prisma } from "@/lib/prisma";
import { createSubDashboardSchema } from "./schema";
import { authActionClient } from "@/actions/safe-action";
import { revalidatePath } from "next/cache";

export const createSubDashboardAction = authActionClient
  .schema(createSubDashboardSchema)
  .metadata({
    name: "create-subdashboard-action",
  })
  .action(
    async ({
      parsedInput: { name, isShared, missionId },
      ctx: { user, auth },
    }) => {
      try {
        const createdItem = await prisma.subDashboard.create({
          data: {
            name,
            isShared,
            missionId,
            userId: user.id,
          },
        });

        revalidatePath(`/missions/${missionId}/`);

        return {
          success: true,
          data: createdItem,
        };
      } catch (error) {
        console.error("[CREATE_SUB_DASHBOARD_ERROR]", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Une erreur est survenue",
        };
      }
    }
  );
