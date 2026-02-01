"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "@/actions/safe-action";
import { revalidatePath } from "next/cache";
import { updateCampaignSchema } from "./schema";

export const updateNotificationCampaignAction = authActionClient
  .schema(updateCampaignSchema)
  .metadata({ name: "update-notification-campaign-action" })
  .action(async ({ parsedInput }) => {
    const { campaignId, ...patch } = parsedInput;

    const existing = await prisma.notificationCampaign.findUnique({
      where: { id: campaignId },
      select: { id: true, status: true },
    });
    if (!existing) throw new Error("Campagne introuvable");
    if (["sending", "sent", "cancelled"].includes(existing.status)) {
      throw new Error("Campagne non modifiable dans cet état.");
    }

    const updated = await prisma.notificationCampaign.update({
      where: { id: campaignId },
      data: {
        type: patch.type,
        title: patch.title,
        body: patch.body ?? null,
        data: patch.data ?? undefined,
        channels: patch.channels as any,
        targeting: patch.targeting as any,
        scheduledAt: patch.scheduledAt ?? null,
        status:
          patch.scheduledAt && patch.scheduledAt > new Date()
            ? "scheduled"
            : existing.status === "scheduled"
              ? "draft"
              : existing.status,
      },
    });

    revalidatePath("/notifications");
    return { success: true, data: updated };
  });
