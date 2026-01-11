// app/api/comments/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { transporter } from "@/lib/transporter";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const missionId = searchParams.get("missionId") ?? undefined;
  const surveyId = searchParams.get("surveyId") ?? undefined;
  const surveyResponseId = searchParams.get("surveyResponseId") ?? undefined;
  const questionKey = searchParams.get("questionKey") ?? undefined;
  const parentId = searchParams.get("parentId") ?? undefined;

  const where: any = {
    deletedAt: null,
  };

  if (missionId) where.missionId = missionId;
  if (surveyId) where.surveyId = surveyId;
  if (surveyResponseId) where.surveyResponseId = surveyResponseId;
  if (questionKey) where.questionKey = questionKey;
  if (parentId) where.parentId = parentId;
  else where.parentId = null; // liste les commentaires racine par défaut

  const comments = await prisma.comment.findMany({
    where,
    orderBy: { createdAt: "asc" },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, image: true },
      },
      resolvedBy: {
        select: { id: true, name: true, email: true, image: true },
      },
      mentions: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
      _count: {
        select: { replies: true }, // si tu as une relation replies dans Prisma
      },
    },
  });

  return NextResponse.json(comments);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  const {
    missionId,
    surveyId,
    surveyResponseId,
    questionKey,
    parentId,
    content,
    mentions,
  } = body as {
    missionId?: string;
    surveyId?: string;
    surveyResponseId?: string;
    questionKey?: string;
    parentId?: string;
    content: string;
    mentions?: string[];
  };

  if (!content || !content.trim()) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  // création du commentaire + mentions + event dans une transaction
  const result = await prisma.$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: {
        missionId: missionId ?? null,
        surveyId: surveyId ?? null,
        surveyResponseId: surveyResponseId ?? null,
        questionKey: questionKey ?? null,
        parentId: parentId ?? null,
        content: content.trim(),
        createdById: user.id,
        status: "open",
      },
    });

    // Mentions
    let createdMentions = [] as any[];
    if (Array.isArray(mentions) && mentions.length > 0) {
      createdMentions = await tx.commentMention.createManyAndReturn({
        data: mentions.map((userId) => ({
          commentId: comment.id,
          userId,
        })),
      });
    }

    // Event "created"
    await tx.commentEvent.create({
      data: {
        commentId: comment.id,
        type: "created",
        payload: {
          missionId,
          surveyId,
          surveyResponseId,
          questionKey,
          parentId,
        },
        createdById: user.id,
      },
    });

    const fullComment = await tx.comment.findUnique({
      where: { id: comment.id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, image: true },
        },
        mentions: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    });

    return fullComment;
  });

  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const locale = segments[0] ?? "fr";
  let workspaceId: string | undefined;
  if (missionId) {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      select: { workspaceId: true },
    });
    workspaceId = mission?.workspaceId ?? undefined;
  }

  if (result?.mentions?.length && missionId && workspaceId) {
    const commentUrl = `${appUrl}/${locale}/missions/${workspaceId}/${missionId}/dashboard?commentId=${result.id}`;

    await Promise.all(
      result.mentions.map((mention: any) =>
        transporter.sendMail({
          from: "no-reply@tadaiq.com",
          to: [mention.user.email],
          subject: "[Tada] Vous avez été mentionné dans un commentaire",
          html: `
            <p>${result.createdBy.name} vous a mentionné dans un commentaire sur une mission.</p>
            <p>"${result.content}"</p>
            <p><a href="${commentUrl}">Voir le commentaire dans le dashboard</a></p>
          `,
        })
      )
    );
  }

  return NextResponse.json(result, { status: 201 });
}
