"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { updateTemplateSchema } from "./schema";

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
    } catch (error) {
      console.error("[UPDATE_TEMPLATE_ERROR]", error);
      return {
        success: false,
      };
    }
  });
