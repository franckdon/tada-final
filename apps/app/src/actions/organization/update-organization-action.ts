"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authActionClient } from "../safe-action";
import { updateOrganizationSchema } from "./schema";

export const updateOrganizationAction = authActionClient
  .schema(updateOrganizationSchema)
  .metadata({
    name: "update-organization-action",
  })
  .action(
    async ({
      parsedInput: { name, slug, logo, metadata, id, status },
      ctx: { user },
    }) => {
      try {
        const updatedOrganization = await prisma.organization.update({
          where: {
            id,
          },
          data: {
            name,
            slug,
            logo,
            status,
            metadata: JSON.stringify(metadata),
          },
        });

        revalidatePath(`/settings/organizations/${id}`);
        return { success: true, data: updatedOrganization };
      } catch (error) {
        console.error("[UPDATE_ORGANIZATION_ERROR]", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Une erreur est survenue",
        };
      }
    }
  );
