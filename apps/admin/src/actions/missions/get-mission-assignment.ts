"use server";

import { prisma } from "@/lib/prisma";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

const action = createSafeActionClient();

const getMissionAssignmentsSchema = z.object({
  missionId: z.string(),
});

export const getMissionAssignmentsAction = action
  .schema(getMissionAssignmentsSchema)
  .action(async ({ parsedInput }) => {
    const { missionId } = parsedInput;

    try {
      const assignments = await prisma.missionAssignment.findMany({
        where: {
          missionId,
        },
        include: {
          contributor: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          assignedByUser: true,
        },
        orderBy: {
          assignedAt: "desc",
        },
      });

      // Enrichir avec des statistiques
      const assignmentsWithStats = assignments.map((assignment) => ({
        ...assignment,
        // Simulation de progression - vous pouvez implémenter votre logique
        progressPercentage:
          assignment.status === "completed"
            ? 100
            : assignment.status === "in_progress"
            ? Math.floor(Math.random() * 80) + 10
            : assignment.status === "accepted"
            ? Math.floor(Math.random() * 20)
            : 0,
      }));

      return {
        assignments: assignmentsWithStats,
        total: assignments.length,
        byStatus: {
          assigned: assignments.filter((a) => a.status === "assigned").length,
          accepted: assignments.filter((a) => a.status === "accepted").length,
          in_progress: assignments.filter((a) => a.status === "in_progress")
            .length,
          completed: assignments.filter((a) => a.status === "completed").length,
          cancelled: assignments.filter((a) => a.status === "cancelled").length,
        },
      };
    } catch (error) {
      console.error("Error fetching mission assignments:", error);
      throw new Error("Erreur lors de la récupération des assignations");
    }
  });
