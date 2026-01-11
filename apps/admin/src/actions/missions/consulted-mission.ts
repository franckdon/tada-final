"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "../safe-action"; // Assuming authActionClient is in ../safe-action

const RecordMissionConsultationSchema = z.object({
  organizationId: z.string(),
  missionId: z.string(),
});

export const recordMissionConsultation = authActionClient
  .schema(RecordMissionConsultationSchema)
  .metadata({
    name: "record-mission-consultation-action", // Add a metadata name
  })
  .action(
    async ({
      parsedInput: { organizationId, missionId },
      ctx: { user, auth }, // Include ctx even if not directly used, as per authActionClient pattern
    }) => {
      try {
        // Check if the consultation already exists
        const existingConsultation = await prisma.consultedMission.findUnique({
          where: {
            organizationId_missionId: {
              organizationId,
              missionId,
            },
          },
        });

        if (existingConsultation) {
          return {
            success: true,
            message: "Mission already consulted by this organization.",
          };
        }

        // Create a new consultation record
        await prisma.consultedMission.create({
          data: {
            organizationId,
            missionId,
          },
        });

        revalidatePath(`/market-beats/${organizationId}`); // Revalidate the page to reflect new consultation count
        return {
          success: true,
          message: "Mission consultation recorded successfully.",
        };
      } catch (error) {
        console.error("Error recording mission consultation:", error);
        return {
          success: false,
          message: "Failed to record mission consultation.",
        };
      }
    }
  );
