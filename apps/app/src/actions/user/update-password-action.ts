"use server";

import { z } from "zod";
import { authActionClient } from "../safe-action";

const updatePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
});

export const updatePasswordAction = authActionClient
  .schema(updatePasswordSchema)
  .metadata({
    name: "update-password-action",
  })
  .action(async ({ parsedInput: { newPassword }, ctx: { user, auth } }) => {
    try {
      const ctx = await auth.$context;
      const hash = await ctx.password.hash(newPassword);
      await ctx.internalAdapter.updatePassword(user.id, hash);
      return { success: true };
    } catch (error) {
      console.error("[UPDATE_PASSWORD_ERROR]", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  });
