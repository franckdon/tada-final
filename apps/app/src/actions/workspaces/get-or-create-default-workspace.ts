// src/actions/workspaces/get-or-create-default-workspace.ts
"use server";

import { authActionClient } from "../safe-action";
import { prisma } from "@/lib/prisma";
import { ensureDefaultWorkspaceForOrganization } from "@/lib/workspaces";
import { z } from "zod";

const schema = z.object({
  organizationId: z.string(),
});

export const getOrCreateDefaultWorkspaceAction = authActionClient
  .schema(schema)
  .metadata({ name: "get-or-create-default-workspace" })
  .action(async ({ parsedInput: { organizationId }, ctx: { user } }) => {
    try {
      const ownerUserId = user.id ?? user.userId;

      const workspace = await ensureDefaultWorkspaceForOrganization({
        organizationId,
        ownerUserId,
      });

      return { success: true, data: workspace };
    } catch (error) {
      console.error("[GET_OR_CREATE_WORKSPACE_ERROR]", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  });
