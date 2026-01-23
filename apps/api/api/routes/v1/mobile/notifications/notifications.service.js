"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.listNotifications = listNotifications;
exports.getNotificationDetails = getNotificationDetails;
exports.markNotificationRead = markNotificationRead;
exports.markAllNotificationsRead = markAllNotificationsRead;
exports.emitNotification = emitNotification;
const repo = __importStar(require("./notifications.repo"));
const notifications_stream_1 = require("./notifications.stream");
function toItem(r) {
    return {
        id: r.id,
        type: r.type,
        title: r.title,
        body: r.body,
        data: r.data ?? null,
        entityType: r.entityType,
        entityId: r.entityId,
        readAt: r.readAt,
        createdAt: r.createdAt,
    };
}
async function createNotification(currentUserId, input, internalKey) {
    // Hard security: only internal calls can create notifications
    // (sinon n’importe qui peut spammer tous les users)
    const expected = process.env.INTERNAL_API_KEY ?? "";
    if (!expected || internalKey !== expected) {
        return { ok: false, status: 403, message: "Accès interdit (INTERNAL_ONLY)" };
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
    return { ok: true, data: { notification: row } };
}
async function listNotifications(userId, query) {
    const unreadCount = await repo.countUnread(userId);
    const { rows, total } = await repo.listNotifications(userId, query);
    const page = query.page;
    const pageSize = query.pageSize;
    const pageCount = Math.ceil(total / pageSize);
    return {
        ok: true,
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
async function getNotificationDetails(userId, id) {
    const n = await repo.getNotificationById(userId, id);
    if (!n)
        return { ok: false, status: 404, message: "Notification introuvable" };
    return { ok: true, data: { notification: toItem(n) } };
}
async function markNotificationRead(userId, id) {
    const ok = await repo.markRead(userId, id);
    if (!ok)
        return { ok: false, status: 404, message: "Notification introuvable" };
    const unreadCount = await repo.countUnread(userId);
    (0, notifications_stream_1.broadcastUnreadCount)(userId, unreadCount);
    return { ok: true, data: { ok: true } };
}
async function markAllNotificationsRead(userId) {
    const updated = await repo.markReadAll(userId);
    const unreadCount = await repo.countUnread(userId);
    (0, notifications_stream_1.broadcastUnreadCount)(userId, unreadCount);
    return { ok: true, data: { ok: true, updated } };
}
/**
 * Utilitaire interne pour créer une notif et pousser en SSE.
 * Tu l’appelles depuis d’autres services (missions/paiement/support…).
 */
async function emitNotification(args) {
    const row = await repo.createNotification(args);
    const item = toItem(row);
    // push realtime
    (0, notifications_stream_1.broadcastNotification)(args.userId, item);
    // push unreadCount (optionnel mais utile)
    const unreadCount = await repo.countUnread(args.userId);
    (0, notifications_stream_1.broadcastUnreadCount)(args.userId, unreadCount);
    return item;
}
