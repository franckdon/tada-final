"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { deleteTemplateSchema } from "./schema";
import { revalidatePath } from "next/cache";

export const deleteTemplateAction = authActionClient
  .schema(deleteTemplateSchema)
  .metadata({
    name: "delete-template-action",
  })
  .action(async ({ parsedInput: { templateId }, ctx: { user, auth } }) => {
    try {
      const template = await prisma.template.delete({
        where: {
          id: templateId,
        },
      });

      revalidatePath(`/templates`);
      return { success: true, data: template };
    } catch (error) {
      console.error("[DELETE_TEMPLATE_ERROR]", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  });
