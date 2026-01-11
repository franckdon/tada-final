"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "@/actions/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const deleteSubDashboardItemSchema = z.object({
  id: z.string(),
});

export const deleteSubDashboardItemAction = authActionClient
  .schema(deleteSubDashboardItemSchema)
  .metadata({ name: "delete-subdashboard-item" })
  .action(async ({ parsedInput: { id } }) => {
    try {
      await prisma.subDashboardItem.delete({ where: { id } });
      revalidatePath(`/missions/*/sub-dashboard/*`);
      return { success: true };
    } catch (error) {
      console.error("[DELETE_SUB_DASHBOARD_ITEM_ERROR]", error);
      return { success: false, error: "Failed to delete item" };
    }
  });
