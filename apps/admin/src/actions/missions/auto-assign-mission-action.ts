// src/actions/missions/auto-assign-mission-action.ts
"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "@/actions/safe-action";
import { z } from "zod";

const baseSchema = z.object({
  missionId: z.string().min(1),
  // optionnel: limiter le nombre de candidats (preview / assign)
  limit: z.number().int().positive().optional(),
});

function computeAge(birthDate: Date) {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
  return age;
}

function normalizeToArray<T>(value: T | T[]) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

type AudienceJson = Record<string, any>;

function matchContributor(params: {
  contributor: {
    birth_date: Date | null;
    sex: string | null;
    country: string | null;
    location: string | null;
  };
  audiences: AudienceJson;
  missionZone: string | null;
}) {
  const { contributor: c, audiences, missionZone } = params;

  // pays
  if (audiences.country) {
    const allowed = normalizeToArray(audiences.country).map(String);
    if (!c.country || !allowed.includes(String(c.country))) return false;
  }

  // sexe
  if (audiences.sex) {
    const allowed = normalizeToArray(audiences.sex).map(String);
    if (!c.sex || !allowed.includes(String(c.sex))) return false;
  }

  // âge
  const minAge = audiences.minAge ?? audiences.ageMin;
  const maxAge = audiences.maxAge ?? audiences.ageMax;

  if (minAge !== undefined || maxAge !== undefined) {
    if (!c.birth_date) return false;

    const age = computeAge(c.birth_date);
    if (minAge !== undefined && age < Number(minAge)) return false;
    if (maxAge !== undefined && age > Number(maxAge)) return false;
  }

  // zone (simple contains)
  if (missionZone) {
    if (!c.location) return false;
    const zone = String(missionZone).toLowerCase();
    const loc = String(c.location).toLowerCase();
    if (!loc.includes(zone)) return false;
  }

  return true;
}

/**
 * ✅ PREVIEW : renvoie la liste des contributeurs matchés (sans assigner)
 * - utile pour afficher "X contributeurs matchés" + liste scrollable
 * - autorisé même avant publication (isPublish=false)
 */
export const previewAutoAssignMissionAction = authActionClient
  .schema(
    baseSchema.extend({
      // limite de preview (par défaut 50)
      previewTake: z.number().int().positive().max(200).optional(),
    }),
  )
  .metadata({ name: "preview-auto-assign-mission-action" })
  .action(async ({ parsedInput, ctx: { user } }) => {
    const { missionId, limit, previewTake } = parsedInput;

    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      select: {
        id: true,
        validationStatus: true,
        audiences: true,
        zone: true,
      },
    });

    if (!mission) throw new Error("Mission introuvable");

    // Guard: preview seulement si approuvée (alignement CDC)
    if (mission.validationStatus !== "approved") {
      throw new Error("Mission non approuvée (validationStatus != approved)");
    }

    const audiences = (mission.audiences ?? {}) as AudienceJson;

    // ⚠️ IMPORTANT : adapte ici si tes champs User diffèrent
    const contributors = await prisma.user.findMany({
      where: {
        role: "contributor",
        OR: [{ banned: false }, { banned: null }],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        birth_date: true,
        sex: true,
        country: true,
        location: true,
      },
      take: 20000,
    });

    const matches = contributors.filter((c) =>
      matchContributor({
        contributor: {
          birth_date: c.birth_date ?? null,
          sex: (c as any).sex ?? null,
          country: (c as any).country ?? null,
          location: (c as any).location ?? null,
        },
        audiences,
        missionZone: mission.zone ?? null,
      }),
    );

    const candidates = limit ? matches.slice(0, limit) : matches;

    const take = previewTake ?? 50;
    const previewList = candidates.slice(0, take).map((c) => ({
      id: c.id,
      name: c.name ?? "—",
      email: c.email ?? "—",
      image: c.image ?? null,
    }));

    return {
      success: true,
      data: {
        candidatesCount: candidates.length,
        previewCount: previewList.length,
        previewList,
      },
    };
  });

/**
 * ✅ AUTO-ASSIGN : crée réellement les mission_assignment (CDC "100% du matching")
 * - à exécuter après publication
 */
export const autoAssignMissionAction = authActionClient
  .schema(baseSchema)
  .metadata({ name: "auto-assign-mission-action" })
  .action(async ({ parsedInput, ctx: { user } }) => {
    const { missionId, limit } = parsedInput;

    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      select: {
        id: true,
        isPublish: true,
        validationStatus: true,
        audiences: true,
        zone: true,
      },
    });

    if (!mission) throw new Error("Mission introuvable");

    // ✅ Garde-fous (CDC)
    if (mission.validationStatus !== "approved") {
      throw new Error("Mission non approuvée (validationStatus != approved)");
    }
    if (!mission.isPublish) {
      throw new Error("Mission non publiée (isPublish=false)");
    }

    const audiences = (mission.audiences ?? {}) as AudienceJson;

    // ⚠️ IMPORTANT : adapte ici si tes champs User diffèrent
    const contributors = await prisma.user.findMany({
      where: {
        role: "contributor",
        OR: [{ banned: false }, { banned: null }],
      },
      select: {
        id: true,
        birth_date: true,
        sex: true,
        country: true,
        location: true,
      },
      take: 20000,
    });

    const matches = contributors.filter((c) =>
      matchContributor({
        contributor: {
          birth_date: c.birth_date ?? null,
          sex: (c as any).sex ?? null,
          country: (c as any).country ?? null,
          location: (c as any).location ?? null,
        },
        audiences,
        missionZone: mission.zone ?? null,
      }),
    );

    const candidates = limit ? matches.slice(0, limit) : matches;

    // createMany + skipDuplicates => respecte @@unique([missionId, contributorId])
    const createManyResult = await prisma.missionAssignment.createMany({
      data: candidates.map((c) => ({
        missionId: mission.id,
        contributorId: c.id,
        assignedBy: user.id,
        status: "assigned",
        progress: 0,
        priority: "medium",
      })),
      skipDuplicates: true,
    });

    return {
      success: true,
      data: {
        candidatesCount: candidates.length,
        assignedCount: createManyResult.count,
      },
    };
  });
