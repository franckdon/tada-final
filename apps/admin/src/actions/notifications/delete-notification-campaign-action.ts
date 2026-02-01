"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "@/actions/safe-action";
import { revalidatePath } from "next/cache";
import { deleteCampaignSchema } from "./schema";

export const deleteNotificationCampaignAction = authActionClient
  .schema(deleteCampaignSchema)
  .metadata({ name: "delete-notification-campaign-action" })
  .action(async ({ parsedInput }) => {
    const camp = await prisma.notificationCampaign.findUnique({
      where: { id: parsedInput.campaignId },
      select: { id: true, status: true },
    });
    if (!camp) throw new Error("Campagne introuvable");
    if (camp.status !== "draft") throw new Error("Suppression autorisée uniquement en draft.");

    await prisma.notificationCampaign.delete({
      where: { id: parsedInput.campaignId },
    });

    revalidatePath("/notifications");
    return { success: true };
  });
