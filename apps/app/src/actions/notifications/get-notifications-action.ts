"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { actionClient } from "../safe-action";

const schema = z.object({
  limit: z.number().min(1).max(50).default(10),
  cursor: z.string().optional(), // pagination cursor sur id
});

export const getNotificationsAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput, ctx }) => {
    const userId = ctx?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const { limit, cursor } = parsedInput;

    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        data: true,
        entityType: true,
        entityId: true,
        readAt: true,
        createdAt: true,
      },
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    const unreadCount = await prisma.notification.count({
      where: { userId, readAt: null },
    });

    return { items, nextCursor, unreadCount };
  });
