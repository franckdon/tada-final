"use server";

import { prisma } from "@/lib/prisma";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const action = createSafeActionClient();

const removeAssignmentSchema = z.object({
  assignmentId: z.string(),
  reason: z.string().optional(),
});

export const removeAssignmentAction = action
  .schema(removeAssignmentSchema)
  .action(async ({ parsedInput }) => {
    const { assignmentId, reason } = parsedInput;

    try {
      // Récupérer l'assignation pour avoir les IDs
      const assignment = await prisma.missionAssignment.findUnique({
        where: { id: assignmentId },
        include: {
          mission: true,
          contributor: true,
        },
      });

      if (!assignment) {
        throw new Error("Assignation non trouvée");
      }

      // Supprimer l'assignation
      await prisma.missionAssignment.delete({
        where: { id: assignmentId },
      });

      // Revalider les pages
      revalidatePath("/missions");
      revalidatePath(`/missions/${assignment.missionId}`);

      return {
        success: true,
        message: `${assignment.contributor.name} a été retiré de la mission`,
      };
    } catch (error) {
      console.error("Error removing assignment:", error);
      throw new Error("Erreur lors de la suppression de l'assignation");
    }
  });
