"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSseClient = registerSseClient;
exports.broadcastNotification = broadcastNotification;
exports.broadcastUnreadCount = broadcastUnreadCount;
const clientsByUser = new Map();
function registerSseClient(userId, client) {
    const set = clientsByUser.get(userId) ?? new Set();
    set.add(client);
    clientsByUser.set(userId, set);
    return () => {
        const s = clientsByUser.get(userId);
        if (!s)
            return;
        s.delete(client);
        if (s.size === 0)
            clientsByUser.delete(userId);
    };
}
function broadcastNotification(userId, notif) {
    const set = clientsByUser.get(userId);
    if (!set || set.size === 0)
        return;
    for (const c of set) {
        c.send("notification", notif);
    }
}
// Optionnel: push unreadCount updates (si tu veux)
function broadcastUnreadCount(userId, unreadCount) {
    const set = clientsByUser.get(userId);
    if (!set || set.size === 0)
        return;
    for (const c of set) {
        c.send("unreadCount", { unreadCount });
    }
}
