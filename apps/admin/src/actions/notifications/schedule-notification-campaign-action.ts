"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "@/actions/safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const scheduleSchema = z.object({
  campaignId: z.string().uuid(),
  scheduledAt: z.coerce.date(),
});

export const scheduleNotificationCampaignAction = authActionClient
  .schema(scheduleSchema)
  .metadata({ name: "schedule-notification-campaign-action" })
  .action(async ({ parsedInput }) => {
    const { campaignId, scheduledAt } = parsedInput;

    const campaign = await prisma.notificationCampaign.findUnique({
      where: { id: campaignId },
      select: { id: true, status: true, channels: true, title: true },
    });
    if (!campaign) throw new Error("Campaign introuvable");

    if (campaign.status !== "draft") {
      throw new Error("Seules les campagnes en draft peuvent être programmées.");
    }

    const channels = (campaign.channels ?? {}) as any;
    if (!channels.push && !channels.web) {
      throw new Error("Aucun canal activé (push/web).");
    }

    await prisma.notificationCampaign.update({
      where: { id: campaignId },
      data: {
        status: "scheduled",
        scheduledAt,
      },
    });

    revalidatePath("/notifications");
    return { success: true };
  });
