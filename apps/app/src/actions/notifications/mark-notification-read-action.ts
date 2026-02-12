"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { actionClient } from "../safe-action";

const schema = z.object({
  notificationId: z.string().optional(),
  markAll: z.boolean().optional(),
});

export const markNotificationReadAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput, ctx }) => {
    const userId = ctx?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const { notificationId, markAll } = parsedInput;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() },
      });
      return { success: true };
    }

    if (!notificationId) throw new Error("notificationId required");

    await prisma.notification.updateMany({
      where: { id: notificationId, userId }, // sécurité
      data: { readAt: new Date() },
    });

    return { success: true };
  });
