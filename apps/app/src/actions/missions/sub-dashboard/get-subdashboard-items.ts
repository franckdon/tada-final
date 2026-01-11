"use server";

import { prisma } from "@/lib/prisma";

export async function getSubDashboardItems(subDashboardId: string) {
  try {
    return await prisma.subDashboardItem.findMany({
      where: { subDashboardId },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("[GET_SUB_DASHBOARD_ITEMS_ERROR]", error);
    return [];
  }
}
