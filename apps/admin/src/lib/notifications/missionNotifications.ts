import "server-only";
import { createNotifications } from "@/lib/notifications/notificationService";

type MissionValidationStatus = "approved" | "rejected" | "modification_requested";

export async function notifyMissionValidated(params: {
  userId: string; // owner workspace (client)
  missionId: string;
  missionName: string;
  validationStatus: MissionValidationStatus;
  comment?: string | null;
  validatorId?: string; // optionnel
}) {
  const { userId, missionId, missionName, validationStatus, comment, validatorId } =
    params;

  const title =
    validationStatus === "approved"
      ? "Mission approuvée"
      : validationStatus === "rejected"
        ? "Mission rejetée"
        : "Modifications demandées";

  const body =
    validationStatus === "approved"
      ? `Votre mission "${missionName}" a été approuvée et est maintenant en ligne (live).`
      : validationStatus === "rejected"
        ? `Votre mission "${missionName}" a été rejetée.${comment ? `\n\nCommentaire: ${comment}` : ""}`
        : `Des modifications sont demandées pour "${missionName}".${comment ? `\n\nCommentaire: ${comment}` : ""}`;

  return createNotifications([
    {
      userId,
      type: "mission_validated",
      title,
      body,
      entityType: "mission",
      entityId: missionId,
      data: {
        missionId,
        missionName,
        validationStatus,
        comment: comment ?? null,
        validatorId: validatorId ?? null,
      },
    },
  ]);
}
