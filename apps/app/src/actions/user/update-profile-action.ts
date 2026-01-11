"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "../safe-action";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  position: z.string().min(2, "Le poste doit contenir au moins 2 caractères"),
  /*   country: z.string().min(1, "Veuillez sélectionner un pays"),
  sector: z.string().min(1, "Veuillez sélectionner un secteur"), */
  avatarUrl: z.string().optional().nullable(),
});

export const updateProfileAction = authActionClient
  .schema(updateProfileSchema)
  .metadata({
    name: "update-profile-action",
  })
  .action(
    async ({
      parsedInput: { name, email, position, avatarUrl },
      ctx: { user },
    }) => {
      try {
        const updatedUser = await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            name,
            email,
            position,
            /*    country,
            sector, */
            image: avatarUrl,
          },
        });

        revalidatePath("/settings/profile");
        return { success: true, data: updatedUser };
      } catch (error) {
        console.error("[UPDATE_PROFILE_ERROR]", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Une erreur est survenue",
        };
      }
    }
  );
