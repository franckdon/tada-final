import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  notificationId: z.string().optional(),
  markAll: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 },
      );
    }

    const now = new Date();

    if (parsed.data.markAll) {
      await prisma.notification.updateMany({
        where: {
          userId,
          readAt: null,
        },
        data: {
          readAt: now,
        },
      });

      return NextResponse.json({ success: true });
    }

    if (!parsed.data.notificationId) {
      return NextResponse.json(
        { success: false, error: "notificationId is required" },
        { status: 400 },
      );
    }

    await prisma.notification.updateMany({
      where: {
        id: parsed.data.notificationId,
        userId,
      },
      data: {
        readAt: now,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MARK_NOTIFICATION_READ_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}