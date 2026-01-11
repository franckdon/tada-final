"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";
import { authActionClient } from "../safe-action";
import { updateMissionPermissionsSchema } from "./schema";

const prisma = new PrismaClient();

export const updateMissionPermissionsAction = authActionClient
  .metadata({
    name: "update-mission-permissions",
  })
  .schema(updateMissionPermissionsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { missionId, isPublic, authorizedUserIds, orgId } = parsedInput;
    const {
      user: { id: currentUserId },
    } = ctx;

    try {
      const mission = await prisma.mission.findUnique({
        where: { id: missionId },
        include: {
          organization: true,
        },
      });

      if (!mission) {
        throw new Error("Mission non trouvée");
      }

      await prisma.$transaction(async (tx) => {
        await tx.mission.update({
          where: { id: missionId },
          data: { isPublic },
        });

        await tx.missionPermission.deleteMany({
          where: { missionId },
        });

        if (!isPublic && authorizedUserIds.length > 0) {
          const users = await tx.user.findMany({
            where: { id: { in: authorizedUserIds } },
            select: { id: true },
          });

          if (users.length !== authorizedUserIds.length) {
            throw new Error("Certains utilisateurs n'existent pas");
          }

          await tx.missionPermission.createMany({
            data: authorizedUserIds.map((userId) => ({
              missionId,
              userId,
              grantedBy: currentUserId,
            })),
          });
        }
      });

      revalidatePath(`/missions/${mission?.organizationId}`);

      return {
        success: true,
        message: "Permissions mises à jour avec succès",
        data: {
          missionId,
          isPublic,
          authorizedUsersCount: isPublic ? 0 : authorizedUserIds.length,
        },
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour des permissions:", error);
      throw new Error("Erreur lors de la mise à jour des permissions");
    }
  });

export async function getAvailableUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.error("[GET_AVAILABLES_USERS]", error);
  }
}
