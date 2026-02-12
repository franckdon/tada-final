// src/lib/notifications/notificationService.ts
import "server-only";
import { prisma } from "@/lib/prisma";

export type NotificationEntityType =
  | "mission"
  | "mission_assignment"
  | "workspace"
  | "invoice"
  | "comment"
  | "system";

export type NotificationType =
  | "system"
  | "mission_assigned"
  | "mission_validated"
  | "mission_assignment_status";

type CreateNotificationInput = {
  userId: string;
  type?: string;
  title: string;
  body?: string | null;
  data?: any;
  entityType?: NotificationEntityType | string | null;
  entityId?: string | null;
};

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type ?? "system",
      title: input.title,
      body: input.body ?? null,
      data: input.data ?? undefined,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
    },
  });
}

export async function createNotifications(inputs: CreateNotificationInput[]) {
  if (!inputs.length) return { count: 0 };

  return prisma.notification.createMany({
    data: inputs.map((i) => ({
      userId: i.userId,
      type: i.type ?? "system",
      title: i.title,
      body: i.body ?? null,
      data: i.data ?? undefined,
      entityType: (i.entityType as any) ?? null,
      entityId: i.entityId ?? null,
    })),
  });
}

export async function notifyMissionAssigned(params: {
  missionId: string;
  missionName: string;
  contributorIds: string[];
  assignedByUserId: string;
  priority?: string;
  dueDate?: Date | null;
  notes?: string | null;
}) {
  const { missionId, missionName, contributorIds, assignedByUserId } = params;

  const title = "Nouvelle mission assignée";
  const body = `Vous avez été assigné(e) à la mission "${missionName}".`;

  return createNotifications(
    contributorIds.map((userId) => ({
      userId,
      type: "mission_assigned",
      title,
      body,
      entityType: "mission",
      entityId: missionId,
      data: {
        missionId,
        missionName,
        assignedByUserId,
        priority: params.priority ?? "medium",
        dueDate: params.dueDate ? params.dueDate.toISOString() : null,
        notes: params.notes ?? null,
      },
    })),
  );
}
