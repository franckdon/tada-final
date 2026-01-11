import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

type RouteParams = {
  params: { id: string };
};

export async function PATCH(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = params;
  const body = await req.json().catch(() => ({} as any));

  const {
    content,
    mentions,
    status,
  }: {
    content?: string;
    mentions?: string[];
    status?: "open" | "resolved" | "archived";
  } = body;

  const existing = await prisma.comment.findUnique({
    where: { id },
    select: {
      id: true,
      content: true,
      status: true,
      createdById: true,
      deletedAt: true,
    },
  });

  if (!existing) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (existing.deletedAt) {
    return new NextResponse("Comment deleted", { status: 400 });
  }

  const isAuthor = existing.createdById === user.id;
  const isAdmin = (user as any).role === "admin";

  if (!isAuthor && !isAdmin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const trimmedContent = typeof content === "string" ? content.trim() : undefined;
  const previousContent = existing.content;
  const previousStatus = existing.status;

  const result = await prisma.$transaction(async (tx) => {
    const data: any = {};

    // 1) Contenu + editedAt
    let contentChanged = false;
    if (typeof trimmedContent === "string" && trimmedContent.length > 0) {
      if (trimmedContent !== existing.content) {
        data.content = trimmedContent;
        data.editedAt = new Date();
        contentChanged = true;
      }
    }

    // 2) Status (open / resolved / archived)
    let statusChanged = false;
    if (status && status !== existing.status) {
      if (!["open", "resolved", "archived"].includes(status)) {
        throw new Error("Invalid status");
      }

      data.status = status;
      statusChanged = true;

      if (status === "resolved") {
        // On marque qui a résolu + quand
        data.resolvedById = user.id;
        data.resolvedAt = new Date();
      } else if (status === "open") {
        // On ré-ouvre : on nettoie les infos de résolution
        data.resolvedById = null;
        data.resolvedAt = null;
      } else if (status === "archived") {
        // Archivé : à toi de décider, ici on garde resolvedBy/At tels quels
      }
    }

    const updated = await tx.comment.update({
      where: { id },
      data,
    });

    // 3) Mentions : reset + recreate si fourni
    if (Array.isArray(mentions)) {
      await tx.commentMention.deleteMany({
        where: { commentId: id },
      });

      if (mentions.length > 0) {
        await tx.commentMention.createMany({
          data: mentions.map((userId) => ({
            commentId: id,
            userId,
          })),
        });
      }
    }

    // 4) CommentEvents
    if (contentChanged) {
      await tx.commentEvent.create({
        data: {
          commentId: id,
          type: "edited",
          payload: {
            previousContent,
            newContent: trimmedContent,
          },
          createdById: user.id,
        },
      });
    }

    if (statusChanged) {
      await tx.commentEvent.create({
        data: {
          commentId: id,
          type: "status_changed",
          payload: {
            previousStatus,
            newStatus: status,
          },
          createdById: user.id,
        },
      });
    }

    // 5) On renvoie le commentaire complet pour le front (CommentLite)
    const fullComment = await tx.comment.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, image: true },
        },
        resolvedBy: {
          select: { id: true, name: true, email: true, image: true },
        },
        mentions: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        replies: {
          include: {
            createdBy: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return fullComment;
  });

  return NextResponse.json(result);
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = params;

  const existing = await prisma.comment.findUnique({
    where: { id },
    select: {
      id: true,
      createdById: true,
      deletedAt: true,
    },
  });

  if (!existing) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isAuthor = existing.createdById === user.id;
  const isAdmin = (user as any).role === "admin";

  if (!isAuthor && !isAdmin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (existing.deletedAt) {
    return new NextResponse("Already deleted", { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.comment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    await tx.commentEvent.create({
      data: {
        commentId: id,
        type: "deleted",
        payload: null,
        createdById: user.id,
      },
    });
  });

  return new NextResponse(null, { status: 204 });
}
