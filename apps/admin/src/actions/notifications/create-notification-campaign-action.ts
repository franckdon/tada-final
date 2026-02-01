"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "@/actions/safe-action";
import { revalidatePath } from "next/cache";
import { createCampaignSchema } from "./schema";

export const createNotificationCampaignAction = authActionClient
  .schema(createCampaignSchema)
  .metadata({ name: "create-notification-campaign-action" })
  .action(async ({ parsedInput, ctx: { user } }) => {
    const status =
      parsedInput.scheduledAt && parsedInput.scheduledAt > new Date()
        ? "scheduled"
        : "draft";

    const created = await prisma.notificationCampaign.create({
      data: {
        type: parsedInput.type ?? "system",
        title: parsedInput.title,
        body: parsedInput.body ?? null,
        data: parsedInput.data ?? undefined,
        channels: parsedInput.channels as any,
        targeting: parsedInput.targeting as any,
        status,
        scheduledAt: parsedInput.scheduledAt ?? null,
        createdById: user?.id ?? null,
      },
    });

    revalidatePath("/notifications");
    return { success: true, data: created };
  });
