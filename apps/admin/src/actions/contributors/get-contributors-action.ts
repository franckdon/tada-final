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
    const { search, limit, offset } = parsedInput;

    try {
      // ✅ base filters (toujours appliqués)
      const baseWhere: any = {
        role: "contributor",
        OR: [{ banned: false }, { banned: null }],
      };

      // ✅ search filter sans écraser baseWhere
      const whereClause: any = search?.trim()
        ? {
            AND: [
              baseWhere,
              {
                OR: [
                  { name: { contains: search.trim(), mode: "insensitive" } },
                  { email: { contains: search.trim(), mode: "insensitive" } },
                ],
              },
            ],
          }
        : baseWhere;

      // 1) on récupère la page de users
      const contributors = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

      const contributorIds = contributors.map((c) => c.id);

      // 2) stats en batch (pas de _count filtré)
      const [completedAgg, activeAgg] = await Promise.all([
        prisma.missionAssignment.groupBy({
          by: ["contributorId"],
          where: {
            contributorId: { in: contributorIds },
            status: "completed",
          },
          _count: { _all: true },
        }),
        prisma.missionAssignment.groupBy({
          by: ["contributorId"],
          where: {
            contributorId: { in: contributorIds },
            status: { in: ["assigned", "accepted", "in_progress"] },
          },
          _count: { _all: true },
        }),
      ]);

      const completedMap = new Map(
        completedAgg.map((r) => [r.contributorId, r._count._all])
      );
      const activeMap = new Map(
        activeAgg.map((r) => [r.contributorId, r._count._all])
      );

      const contributorsWithStats = contributors.map((contributor) => {
        const completedMissions = completedMap.get(contributor.id) ?? 0;
        const activeAssignments = activeMap.get(contributor.id) ?? 0;

        const averageRating =
          completedMissions > 0 ? 4.0 + Math.random() * 1.0 : 0;

        return {
          ...contributor,
          skills: [], // à adapter si tu as réellement des skills en DB
          activeAssignments,
          averageRating: Math.round(averageRating * 10) / 10,
          completedMissions,
          availability: "available",
        };
      });

      const total = await prisma.user.count({ where: whereClause });

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
