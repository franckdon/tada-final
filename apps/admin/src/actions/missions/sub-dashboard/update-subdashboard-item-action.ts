"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "@/actions/safe-action";
import { revalidatePath } from "next/cache";
import { updateSubDashboardItemSchema } from "./schema";

export const updateSubDashboardItemAction = authActionClient
  .schema(updateSubDashboardItemSchema)
  .metadata({ name: "update-subdashboard-item" })
  .action(async ({ parsedInput: { id, content, surveyKey, imageUrl } }) => {
    try {
      const item = await prisma.subDashboardItem.update({
        where: { id },
        data: {
          content,
          surveyKey,
          imageUrl,
          updatedAt: new Date(),
        },
      });

      revalidatePath(`/missions/*/sub-dashboard/${item.subDashboardId}`);
      return { success: true, item };
    } catch (error) {
      console.error("[UPDATE_SUB_DASHBOARD_ITEM_ERROR]", error);
      return { success: false, error: "Failed to update item" };
    }
  });
