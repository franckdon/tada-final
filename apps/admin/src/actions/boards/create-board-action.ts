"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { createBoardSchema } from "./schema";
import { revalidatePath } from "next/cache";

export const createBoardAction = authActionClient
  .schema(createBoardSchema)
  .metadata({
    name: "create-board-action",
  })
  .action(async ({ parsedInput: { name, missionId }, ctx: { user, auth } }) => {
    try {
      const board = await prisma.project.create({
        data: {
          name,
          organizationId: "null",
          missionId,
        },
      });
      return { success: true, data: board };
    } catch (error) {
      console.error("[CREATE_BOARD_ERROR]", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  });
