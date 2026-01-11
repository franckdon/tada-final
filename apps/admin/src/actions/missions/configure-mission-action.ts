// src/actions/missions/configure-mission-action.ts
"use server";

import { prisma } from "@/lib/prisma";
import { action } from "@/lib/safe-action"; // Utilisation de l'instance 'action' corrigée
import { z } from "zod";

// --- Schéma de validation pour la Configuration Opérationnelle ---
const configurationSchema = z.object({
  missionId: z.string().min(1, "ID de mission requis."),
  
  // Paramètres publics et financiers
  imageUrl: z.string().url("URL de l'image de mission invalide.").min(1, "L'image est obligatoire."),
  publicTitle: z.string().min(5, "Le titre public est trop court."),
  publicDescription: z.string().min(20, "La description publique est trop courte."),
  gain: z.number().int().min(1, "Le gain doit être supérieur à zéro."),
  deadline: z.coerce.date().nullable(), // Utilisation de z.coerce.date pour gérer les champs de date de formulaire
  
  // Objectifs et géographie
  targetSubmissions: z.number().int().min(1, "L'objectif de soumissions doit être supérieur à zéro."),
  // NOTE: Les zones géographiques exactes nécessiteraient un schéma plus complexe 
  // (ex: un tableau de codes régionaux/pays), ici on utilise un placeholder string/JSON.
  geographicZones: z.string().optional(), 
  
  // Contraintes de médias
  requiresPhoto: z.boolean(),
  requiresVideo: z.boolean(),
  requiresAudio: z.boolean(),
});

export const configureMissionAction = action(
  configurationSchema,
  async (data) => {
    const { missionId, publicTitle, publicDescription, gain, deadline, targetSubmissions, geographicZones, imageUrl, requiresPhoto, requiresVideo, requiresAudio } = data;

    // 1. Mise à jour des paramètres dans la Mission
    // Note : Le modèle MissionConfigContributor contient déjà les champs 'title', 'description', 'gain', 'duration', 'deadline'.
    
    // Déterminer la durée (si nécessaire, elle pourrait être calculée ici si vous n'utilisez pas 'duration' directement)
    // Ici, nous supposons que 'duration' (BigInt) n'est pas utilisé ou est géré côté client.

    try {
        // Mettre à jour TempMission pour marquer la configuration comme faite et stocker les zones/objectifs
        await prisma.tempMission.update({
            where: { id: missionId },
            data: {
                // Mettre à jour le statut interne après configuration si nécessaire
                status: 'configured', // Nouveau statut: 'configured'
                
                // Stockage des objectifs dans TempMission (si ce champ n'existe pas, vous devrez l'ajouter)
                targetSubmissions: targetSubmissions, // ⚠️ Ajouter ce champ à TempMission si manquant
                geographicZones: geographicZones,     // ⚠️ Ajouter ce champ à TempMission si manquant
            },
        });


        // 2. Créer/Mettre à jour la configuration publique (MissionConfigContributor)
        const missionConfig = await prisma.missionConfigContributor.upsert({
            where: { missionId: missionId }, // Utilisation de missionId pour l'upsert
            update: {
                title: publicTitle,
                description: publicDescription,
                // Le gain est BigInt, s'assurer que le type de la base de données supporte la conversion ou stocker en cents (exemple: gain * 100)
                gain: BigInt(gain), 
                deadline: deadline,
                imageUrl: imageUrl,
                // NOTE: 'duration' est laissé de côté si la deadline est utilisée
            },
            create: {
                missionId: missionId,
                title: publicTitle,
                description: publicDescription,
                gain: BigInt(gain),
                deadline: deadline,
                imageUrl: imageUrl,
                duration: BigInt(0), // Valeur par défaut requise
            }
        });

        // 3. Mise à jour des contraintes médias
        // NOTE: Les champs requiresPhoto/Video/Audio devraient idéalement être dans MissionConfigContributor.
        // Si ces champs manquent, vous devrez les ajouter dans schema.prisma, ou les stocker dans TempMission.
        // Exemple d'ajout à TempMission:
        /*
        await prisma.tempMission.update({
             where: { id: missionId },
             data: {
                 requiresPhoto: requiresPhoto,
                 requiresVideo: requiresVideo,
                 requiresAudio: requiresAudio,
             }
        });
        */

        return { success: true, missionConfig: missionConfig };

    } catch (error) {
        console.error("Erreur lors de la configuration de la mission:", error);
        throw new Error("Impossible d'enregistrer la configuration de la mission.");
    }
  }
);