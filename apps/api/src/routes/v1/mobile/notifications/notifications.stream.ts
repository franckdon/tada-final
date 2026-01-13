import type { NotificationItem } from "./notifications.types";

type Client = {
  userId: string;
  send: (event: string, payload: any) => void;
  close: () => void;
};

const clientsByUser = new Map<string, Set<Client>>();

export function registerSseClient(userId: string, client: Client) {
  const set = clientsByUser.get(userId) ?? new Set<Client>();
  set.add(client);
  clientsByUser.set(userId, set);

  return () => {
    const s = clientsByUser.get(userId);
    if (!s) return;
    s.delete(client);
    if (s.size === 0) clientsByUser.delete(userId);
  };
}

export function broadcastNotification(userId: string, notif: NotificationItem) {
  const set = clientsByUser.get(userId);
  if (!set || set.size === 0) return;

  for (const c of set) {
    c.send("notification", notif);
  }
}

// Optionnel: push unreadCount updates (si tu veux)
export function broadcastUnreadCount(userId: string, unreadCount: number) {
  const set = clientsByUser.get(userId);
  if (!set || set.size === 0) return;

  for (const c of set) {
    c.send("unreadCount", { unreadCount });
  }
}
