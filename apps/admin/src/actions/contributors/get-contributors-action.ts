"use server";

import { prisma } from "@/lib/prisma";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

const action = createSafeActionClient();

const getContributorsSchema = z.object({
  search: z.string().optional(),
  skills: z.array(z.string()).optional(),
  availability: z.string().optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
});

export const getContributorsAction = action
  .schema(getContributorsSchema)
  .action(async ({ parsedInput }) => {
    const { search, skills, availability, limit, offset } = parsedInput;

    try {
      const whereClause: any = {
        role: "contributor",
        banned: { not: true },
      };

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const contributors = await prisma.user.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              missionAssignments: {
                where: {
                  status: "completed",
                },
              },
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take: limit,
        skip: offset,
      });

      // Calculer les statistiques pour chaque contributeur
      const contributorsWithStats = await Promise.all(
        contributors.map(async (contributor) => {
          // Récupérer les assignations actives
          const activeAssignments = await prisma.missionAssignment.count({
            where: {
              contributorId: contributor.id,
              status: { in: ["assigned", "accepted", "in_progress"] },
            },
          });

          // Calculer la note moyenne (simulation - vous pouvez implémenter un vrai système de notation)
          const completedAssignments = await prisma.missionAssignment.count({
            where: {
              contributorId: contributor.id,
              status: "completed",
            },
          });

          const averageRating =
            completedAssignments > 0 ? 4.0 + Math.random() * 1.0 : 0;

          return {
            ...contributor,
            activeAssignments,
            averageRating: Math.round(averageRating * 10) / 10,
            completedMissions: contributor._count.missionAssignments,
            availability: "available",
          };
        })
      );

      const total = await prisma.user.count({
        where: whereClause,
      });

      return {
        contributors: contributorsWithStats,
        total,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      console.error("Error fetching contributors:", error);
      throw new Error("Erreur lors de la récupération des contributeurs");
    }
  });
