import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);
    const cursor = searchParams.get("cursor");

    const items = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
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

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });

    let nextCursor: string | null = null;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id ?? null;
    }

    return NextResponse.json({
      success: true,
      data: {
        items,
        unreadCount,
        nextCursor,
      },
    });
  } catch (error) {
    console.error("[GET_NOTIFICATIONS_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}