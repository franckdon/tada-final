"use server";

import { prisma } from "@/lib/prisma";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const action = createSafeActionClient();

const assignMissionSchema = z.object({
  missionId: z.string(),
  contributorIds: z.array(z.string()),
  assignedBy: z.string(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export const assignMissionAction = action
  .schema(assignMissionSchema)
  .action(async ({ parsedInput }) => {
    const { missionId, contributorIds, assignedBy, priority, dueDate, notes } =
      parsedInput;

    try {
      // Vérifier que la mission existe
      const mission = await prisma.mission.findUnique({
        where: { id: missionId },
      });

      if (!mission) {
        throw new Error("Mission non trouvée");
      }

      // Vérifier que tous les contributeurs existent et sont disponibles
      const contributors = await prisma.user.findMany({
        where: {
          id: { in: contributorIds },
          role: "contributor",
          // banned: { not: true },
        },
      });

      if (contributors.length !== contributorIds.length) {
        throw new Error("Certains contributeurs ne sont pas valides");
      }

      // Créer les assignations
      const assignments = await Promise.all(
        contributorIds.map(async (contributorId) => {
          // Vérifier si l'assignation existe déjà
          const existingAssignment = await prisma.missionAssignment.findUnique({
            where: {
              missionId_contributorId: {
                missionId,
                contributorId,
              },
            },
          });

          if (existingAssignment) {
            return;
          }

          return prisma.missionAssignment.create({
            data: {
              missionId,
              contributorId,
              assignedBy,
              priority,
              dueDate: dueDate ? new Date(dueDate) : null,
              notes,
              status: "assigned",
            },
          });
        })
      );

      revalidatePath("/missions");

      return {
        success: true,
        assignments,
        message: `Mission assignée à ${contributorIds.length} contributeur${
          contributorIds.length > 1 ? "s" : ""
        }`,
      };
    } catch (error) {
      console.error("Error assigning mission:", error);
      throw new Error(
        error instanceof Error ? error.message : "Erreur lors de l'assignation"
      );
    }
  });
