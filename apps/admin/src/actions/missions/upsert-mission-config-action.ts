// src/actions/missions/upsert-mission-config-action.ts
"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { z } from "zod";

export const upsertMissionConfigSchema = z.object({
  missionId: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().min(10),
  gain: z.number().int().nonnegative(),
  // tu peux garder duration, mais pour "date de clôture" => deadline est mieux
  duration: z.number().int().nonnegative().optional(),
  deadline: z.string().datetime().optional(), // ISO
  targetSampleSize: z.number().int().positive(),
});

export const upsertMissionConfigAction = authActionClient
  .schema(upsertMissionConfigSchema)
  .metadata({ name: "upsert-mission-config-action" })
  .action(async ({ parsedInput, ctx: { user } }) => {
    const { missionId, title, description, gain, duration, deadline, targetSampleSize } = parsedInput;

    // Guard: la mission doit exister + être approuvée (brief+questionnaire)
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      select: { id: true, validationStatus: true, image: true },
    });
    if (!mission) throw new Error("Mission introuvable");
    if (mission.validationStatus !== "approved") {
      throw new Error("La mission doit être approuvée avant configuration.");
    }

    // Guard: image obligatoire
    if (!mission.image) {
      throw new Error("Image de mission obligatoire avant publication.");
    }

    // Upsert (1 config par mission)
    // ⚠️ Ton modèle MissionConfigContributor n’a pas de unique(missionId)
    // -> je recommande d’ajouter @@unique([missionId]) au modèle
    // En attendant, on fait: findFirst + update/create
    const existing = await prisma.missionConfigContributor.findFirst({
      where: { missionId },
      select: { id: true },
    });

    const data = {
      missionId,
      title,
      description,
      gain: BigInt(gain),
      duration: BigInt(duration ?? 0),
      deadline: deadline ? new Date(deadline) : null,
      targetSampleSize,
      updatedAt: new Date(),
    };

    const config = existing
      ? await prisma.missionConfigContributor.update({
          where: { id: existing.id },
          data,
        })
      : await prisma.missionConfigContributor.create({
          data: { ...data, createdAt: new Date() },
        });

    return { success: true, config };
  });
