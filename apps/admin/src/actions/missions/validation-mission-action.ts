// src/actions/missions/validation-mission-action.ts
"use server";

import { prisma } from "@/lib/prisma";
import { action, publicProcedure } from "@/lib/safe-action";
import { z } from "zod";

// --- Schéma de validation ---
const validationSchema = z.object({
  missionId: z.string().min(1, "ID de mission requis."),
  // Statuts envoyés par l'interface client
  validationStatus: z.enum(["approved", "rejected", "modification_requested"]), 
  comment: z.string().optional(),
});

// --- Action Serveur ---
export const validateMissionAction = action
  .schema(validationSchema)
  .action(async ({ parsedInput }) => {
    const { missionId, validationStatus, comment } = parsedInput;

    let dbStatus: string;
    
    switch (validationStatus) {
        case "approved":
            dbStatus = "completed"; // Mission prête (peut être renommée 'ready_to_publish' si nécessaire)
            break;
        case "rejected":
            dbStatus = "on hold";
            break;
        case "modification_requested":
            dbStatus = "modification_needed"; // Statut interne pour indiquer que le client doit agir
            break;
        default:
            throw new Error("Statut de validation inconnu.");
    }
    
    // 1. Mettre à jour le statut et le commentaire de la mission temporaire
    const updatedMission = await prisma.mission.update({
      where: { id: missionId },
      data: {
        validationStatus: validationStatus, 
        status: dbStatus, 
        // Sauvegarde le commentaire SuperAdmin
        validationComment: comment, 
        validatedAt: new Date(),
        // Si vous voulez mettre à jour le statut de la Mission finale immédiatement, 
        // vous pouvez l'ajouter ici, mais généralement on attend la publication.
      },
      select: { 
          id: true, 
          name: true, 
          validationStatus: true // Retourne le statut mis à jour
      }
    });

    return { success: true, mission: updatedMission };
  }
);