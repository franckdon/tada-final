// src/actions/missions/validation-mission-action.ts
"use server";

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

    // ✅ Update payload
    const data: Record<string, any> = {
      validationStatus,
      validationComment: comment ?? null,
      validatedAt: new Date(),
    };

    // ✅ Cahier des charges: si approuvée => mission devient LIVE
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

    // ✅ "Envoyer au client" via notification (MVP)
    // Hypothèse: client = owner du workspace de la mission
    if (updatedMission.workspaceId) {
      const ws = await prisma.workspace.findUnique({
        where: { id: updatedMission.workspaceId },
        select: { ownerId: true },
      });

      if (ws?.ownerId) {
        const title =
          validationStatus === "approved"
            ? "Mission approuvée"
            : validationStatus === "rejected"
              ? "Mission rejetée"
              : "Modifications demandées";

        const body =
          validationStatus === "approved"
            ? `Votre mission "${updatedMission.name}" a été approuvée et est maintenant en ligne (live).`
            : validationStatus === "rejected"
              ? `Votre mission "${updatedMission.name}" a été rejetée.\n\nCommentaire: ${comment}`
              : `Des modifications sont demandées pour "${updatedMission.name}".\n\nCommentaire: ${comment}`;

        await prisma.notification.create({
          data: {
            userId: ws.ownerId,
            type: "system",
            title,
            body,
            data: { missionId: updatedMission.id, validationStatus },
            entityType: "mission",
            entityId: updatedMission.id,
          },
        });
      }
    }

    return { success: true, mission: updatedMission };
  });
