// src/actions/missions/publish-mission-action.ts
"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { z } from "zod";

const publishMissionSchema = z.object({
  missionId: z.string().uuid(),
  isPublish: z.boolean(),
  // status n’est plus libre : on contrôle côté serveur
});

export const publishMissionAction = authActionClient
  .schema(publishMissionSchema)
  .metadata({ name: "publish-mission-action" })
  .action(async ({ parsedInput, ctx: { user } }) => {
    const { missionId, isPublish } = parsedInput;

    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      select: { id: true, validationStatus: true, image: true },
    });
    if (!mission) throw new Error("Mission introuvable");

    // Guard: publication seulement si approuvé
    if (isPublish && mission.validationStatus !== "approved") {
      throw new Error("Mission doit être approuvée avant publication.");
    }

    // Guard: image obligatoire
    if (isPublish && !mission.image) {
      throw new Error("Image de mission obligatoire avant publication.");
    }

    // Guard: config obligatoire
    if (isPublish) {
      const config = await prisma.missionConfigContributor.findFirst({
        where: { missionId },
        select: {
          id: true,
          title: true,
          description: true,
          gain: true,
          targetSampleSize: true,
          deadline: true,
        },
      });

      if (!config) throw new Error("Configuration contributeur manquante.");
      if (!config.title || !config.description) throw new Error("Titre/description publics requis.");
      if (!config.gain || config.gain <= 0) throw new Error("Gain requis.");
      if (!config.targetSampleSize || config.targetSampleSize <= 0) throw new Error("Objectif requis.");
      if (!config.deadline) throw new Error("Date de clôture requise.");
    }

    console.log("[publish] mission.image raw =", JSON.stringify(mission.image));
    console.log("[publish] mission.validationStatus =", mission.validationStatus);

    const updated = await prisma.mission.update({
      where: { id: missionId },
      data: isPublish
        ? { isPublish: true, publishAt: new Date(), status: "live" }
        : { isPublish: false, status: "paused" },
    });

    return { success: true, mission: updated };
  });
