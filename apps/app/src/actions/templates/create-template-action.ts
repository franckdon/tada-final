"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { createTemplateSchema } from "./schema";
import { revalidatePath } from "next/cache";

export const createTemplateAction = authActionClient
  .schema(createTemplateSchema)
  .metadata({
    name: "create-template-action",
  })
  .action(
    async ({
      parsedInput: { name, type, organizationId },
      ctx: { user, auth },
    }) => {
      try {
        const template = await prisma.template.create({
          data: {
            name,
            type,
            organizationId,
            status: "active",
            internal: true,
          },
        });
        revalidatePath(`/missions/${organizationId}/templates`);
        return { success: true, data: template };
      } catch (error) {
        console.error("[CREATE_TEMPLATE_ERROR]", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Une erreur est survenue",
        };
      }
    }
  );
