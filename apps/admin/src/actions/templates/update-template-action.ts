"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { updateTemplateSchema } from "./schema";
import { revalidatePath } from "next/cache";

export const updateTemplateAction = authActionClient
  .schema(updateTemplateSchema)
  .metadata({
    name: "update-template-action",
  })
  .action(async ({ parsedInput }) => {
    try {
      const { templateId, questions, name, type } = parsedInput;
      await prisma.template.update({
        where: { id: templateId },
        data: {
          questions,
          name,
          type,
        },
      });

      revalidatePath("/templates/*");
    } catch (error) {
      console.error("[UPDATE_TEMPLATE_ERROR]", error);
      return {
        success: false,
      };
    }
  });
