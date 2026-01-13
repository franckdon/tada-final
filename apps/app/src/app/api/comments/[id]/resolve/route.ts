// app/api/comments/[id]/resolve/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

type RouteParams = {
  params: { id: string };
};

export async function POST(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = params;
  const body = await req.json();
  const { status } = body as { status: "open" | "resolved" };

  if (!["open", "resolved"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.comment.findUnique({
    where: { id },
  });

  if (!existing) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isResolved = status === "resolved";

  const updated = await prisma.$transaction(async (tx) => {
    const comment = await tx.comment.update({
      where: { id },
      data: {
        status,
        resolvedById: isResolved ? user.id : null,
        resolvedAt: isResolved ? new Date() : null,
      },
    });

    await tx.commentEvent.create({
      data: {
        commentId: id,
        type: isResolved ? "resolved" : "reopened",
        payload: null,
        createdById: user.id,
      },
    });

    return comment;
  });

  return NextResponse.json(updated);
}
