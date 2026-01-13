import type { CreateNotificationInput, ListNotificationsQuery } from "./notifications.schemas";
import type {
  NotificationItem,
  NotificationsListData,
  NotificationDetailsData,
  NotificationRow,
  NotificationType,
} from "./notifications.types";

import { ServiceResult } from "../mobile.types"; // adapte le chemin si besoin
import * as repo from "./notifications.repo";
import { broadcastNotification, broadcastUnreadCount } from "./notifications.stream";

function toItem(r: NotificationRow): NotificationItem {
  return {
    id: r.id,
    type: r.type as NotificationType,
    title: r.title,
    body: r.body,
    data: r.data ?? null,
    entityType: r.entityType,
    entityId: r.entityId,
    readAt: r.readAt,
    createdAt: r.createdAt,
  };
}

export async function createNotification(
  currentUserId: string,
  input: CreateNotificationInput,
  internalKey: string | null,
): Promise<ServiceResult<{ notification: any }>> {
  // Hard security: only internal calls can create notifications
  // (sinon n’importe qui peut spammer tous les users)
  const expected = process.env.INTERNAL_API_KEY ?? "";
  if (!expected || internalKey !== expected) {
    return { ok: false as const, status: 403, message: "Accès interdit (INTERNAL_ONLY)" };
  }

  const row = await repo.createNotification({
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    data: input.data ?? null,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
  });

  return { ok: true as const, data: { notification: row } };
}

export async function listNotifications(
  userId: string,
  query: ListNotificationsQuery,
): Promise<ServiceResult<NotificationsListData>> {
  const unreadCount = await repo.countUnread(userId);
  const { rows, total } = await repo.listNotifications(userId, query);

  const page = query.page;
  const pageSize = query.pageSize;
  const pageCount = Math.ceil(total / pageSize);

  return {
    ok: true as const,
    data: {
      items: rows.map(toItem),
      meta: {
        total,
        page,
        pageSize,
        pageCount,
        hasNextPage: page < pageCount,
        hasPrevPage: page > 1,
      },
      unreadCount,
    },
  };
}

export async function getNotificationDetails(
  userId: string,
  id: string,
): Promise<ServiceResult<NotificationDetailsData>> {
  const n = await repo.getNotificationById(userId, id);
  if (!n) return { ok: false as const, status: 404, message: "Notification introuvable" };

  return { ok: true as const, data: { notification: toItem(n) } };
}

export async function markNotificationRead(
  userId: string,
  id: string,
): Promise<ServiceResult<{ ok: true }>> {
  const ok = await repo.markRead(userId, id);
  if (!ok) return { ok: false as const, status: 404, message: "Notification introuvable" };

  const unreadCount = await repo.countUnread(userId);
  broadcastUnreadCount(userId, unreadCount);

  return { ok: true as const, data: { ok: true } };
}

export async function markAllNotificationsRead(
  userId: string,
): Promise<ServiceResult<{ ok: true; updated: number }>> {
  const updated = await repo.markReadAll(userId);

  const unreadCount = await repo.countUnread(userId);
  broadcastUnreadCount(userId, unreadCount);

  return { ok: true as const, data: { ok: true, updated } };
}

/**
 * Utilitaire interne pour créer une notif et pousser en SSE.
 * Tu l’appelles depuis d’autres services (missions/paiement/support…).
 */
export async function emitNotification(args: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  data?: any | null;
  entityType?: string | null;
  entityId?: string | null;
}): Promise<NotificationItem> {
  const row = await repo.createNotification(args);
  const item = toItem(row);

  // push realtime
  broadcastNotification(args.userId, item);

  // push unreadCount (optionnel mais utile)
  const unreadCount = await repo.countUnread(args.userId);
  broadcastUnreadCount(args.userId, unreadCount);

  return item;
}
