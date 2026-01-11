"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authActionClient } from "../safe-action";

const createCommentSchema = z.object({
  missionId: z.string().optional(),
  surveyId: z.string().optional(),
  surveyResponseId: z.string().optional(),
  questionKey: z.string().optional(),
  content: z.string().min(1, "Le contenu du commentaire est requis"),
  parentId: z.string().optional(),
});

export const createCommentAction = authActionClient
  .schema(createCommentSchema)
  .metadata({ name: "create-comment" })
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx;

    const comment = await prisma.comment.create({
      data: {
        missionId: parsedInput.missionId ?? null,
        surveyId: parsedInput.surveyId ?? null,
        surveyResponseId: parsedInput.surveyResponseId ?? null,
        questionKey: parsedInput.questionKey ?? null,
        content: parsedInput.content,
        parentId: parsedInput.parentId ?? null,
        createdById: user.id,
      },
      include: {
        createdBy: true,
        replies: {
          include: { createdBy: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return comment;
  });
