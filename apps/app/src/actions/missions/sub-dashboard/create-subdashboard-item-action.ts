"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "@/actions/safe-action";
import { revalidatePath } from "next/cache";
import { createSubDashboardItemSchema } from "./schema";

export const createSubDashboardItemAction = authActionClient
  .schema(createSubDashboardItemSchema)
  .metadata({ name: "create-subdashboard-item" })
  .action(
    async ({
      parsedInput: { subDashboardId, type, content, surveyKey, imageUrl },
    }) => {
      try {
        const item = await prisma.subDashboardItem.create({
          data: {
            subDashboardId,
            type,
            content: content || null,
            surveyKey: surveyKey || null,
            imageUrl: imageUrl || null,
          },
        });

        revalidatePath(`/missions/*/sub-dashboard/${subDashboardId}`);
        return { success: true, item };
      } catch (error) {
        console.error("[CREATE_SUB_DASHBOARD_ITEM_ERROR]", error);
        return { success: false, error: "Failed to create item" };
      }
    }
  );
