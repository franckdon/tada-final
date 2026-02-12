// src/actions/missions/assign-mission-action.ts
"use server";

import { prisma } from "@/lib/prisma";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { notifyMissionAssigned } from "@/lib/notifications/notificationService";

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
      const mission = await prisma.mission.findUnique({
        where: { id: missionId },
        select: { id: true, name: true },
      });

      if (!mission) throw new Error("Mission non trouvée");

      const contributors = await prisma.user.findMany({
        where: {
          id: { in: contributorIds },
          role: "contributor",
          OR: [{ banned: false }, { banned: null }],
        },
        select: { id: true },
      });

      if (contributors.length !== contributorIds.length) {
        throw new Error("Certains contributeurs ne sont pas valides");
      }

      const createdAssignments = await Promise.all(
        contributorIds.map(async (contributorId) => {
          const existing = await prisma.missionAssignment.findUnique({
            where: {
              missionId_contributorId: { missionId, contributorId },
            },
            select: { id: true },
          });

          if (existing) return null;

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
            select: { id: true, contributorId: true },
          });
        }),
      );

      const actuallyCreated = createdAssignments.filter(
        (a): a is { id: string; contributorId: string } => Boolean(a),
      );

      if (actuallyCreated.length > 0) {
        await notifyMissionAssigned({
          missionId: mission.id,
          missionName: mission.name ?? "Mission",
          contributorIds: actuallyCreated.map((a) => a.contributorId),
          assignedByUserId: assignedBy,
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
          notes: notes ?? null,
        });
      }

      revalidatePath("/missions");

      return {
        success: true,
        assignments: actuallyCreated,
        message: `Mission assignée à ${actuallyCreated.length} contributeur${
          actuallyCreated.length > 1 ? "s" : ""
        }`,
      };
    } catch (error) {
      console.error("Error assigning mission:", error);
      throw new Error(
        error instanceof Error ? error.message : "Erreur lors de l'assignation",
      );
    }
  });
