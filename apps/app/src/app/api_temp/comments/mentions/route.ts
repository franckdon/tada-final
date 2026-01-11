// app/api/comments/mentions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const mentions = await prisma.commentMention.findMany({
    where: {
      userId: user.id,
      seenAt: null,
      comment: {
        deletedAt: null,
      },
    },
    include: {
      comment: {
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, image: true },
          },
          mission: { select: { id: true, name: true } },
          survey: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(mentions);
}
