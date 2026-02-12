// src/actions/missions/validation-mission-action.ts
"use server";

import { notifyMissionValidated } from "@/lib/notifications/missionNotifications";
import { prisma } from "@/lib/prisma";
import { action } from "@/lib/safe-action";
import { z } from "zod";

const validationSchema = z.object({
  missionId: z.string().min(1, "ID de mission requis."),
  validationStatus: z.enum(["approved", "rejected", "modification_requested"]),
  comment: z.string().trim().optional(),
});

export const validateMissionAction = action
  .schema(validationSchema)
  .action(async ({ parsedInput }) => {
    const { missionId, validationStatus } = parsedInput;
    const comment = parsedInput.comment?.trim();

    // ✅ Server-side guard: commentaire obligatoire si rejet / modif demandée
    if (validationStatus !== "approved" && !comment) {
      throw new Error(
        validationStatus === "rejected"
          ? "Commentaire requis pour rejeter une mission."
          : "Commentaire requis pour demander des modifications.",
      );
    }

    const data: Record<string, any> = {
      validationStatus,
      validationComment: comment ?? null,
      validatedAt: new Date(),
    };

    if (validationStatus === "approved") {
      data.status = "live";
    }

    const updatedMission = await prisma.mission.update({
      where: { id: missionId },
      data,
      select: {
        id: true,
        name: true,
        validationStatus: true,
        status: true,
        workspaceId: true,
      },
    });

  
    if (updatedMission.workspaceId) {
      const ws = await prisma.workspace.findUnique({
        where: { id: updatedMission.workspaceId },
        select: { ownerId: true },
      });

      if (ws?.ownerId) {
        await notifyMissionValidated({
          userId: ws.ownerId,
          missionId: updatedMission.id,
          missionName: updatedMission.name ?? "Mission",
          validationStatus,
          comment: comment ?? null,
        });
      }
    }

    return { success: true, mission: updatedMission };
  });
