"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  entityType: string | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
  data: any;
};

type ResponseShape = {
  items: NotificationItem[];
  unreadCount: number;
  nextCursor: string | null;
};

export function useNotifications(limit = 10, pollInterval = 15000) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(
    async (cursor?: string | null, append = false) => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.set("limit", String(limit));
        if (cursor) params.set("cursor", cursor);

        const res = await fetch(`/api/notifications?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });

        const json = await res.json();
        if (!json?.success) return;

        const data = json.data as ResponseShape;

        setUnreadCount(data.unreadCount ?? 0);
        setNextCursor(data.nextCursor ?? null);

        setItems((prev) =>
          append ? [...prev, ...(data.items ?? [])] : (data.items ?? []),
        );
      } catch (error) {
        console.error("[USE_NOTIFICATIONS_FETCH_ERROR]", error);
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  const refresh = useCallback(async () => {
    await fetchNotifications(null, false);
  }, [fetchNotifications]);

  const loadMore = useCallback(async () => {
    if (!nextCursor) return;
    await fetchNotifications(nextCursor, true);
  }, [fetchNotifications, nextCursor]);

  const markOneRead = useCallback(async (notificationId: string) => {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notificationId }),
    });

    setItems((prev) =>
      prev.map((item) =>
        item.id === notificationId
          ? { ...item, readAt: new Date().toISOString() }
          : item,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ markAll: true }),
    });

    const now = new Date().toISOString();
    setItems((prev) => prev.map((item) => ({ ...item, readAt: now })));
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    refresh();

    intervalRef.current = setInterval(() => {
      refresh();
    }, pollInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh, pollInterval]);

  return {
    items,
    unreadCount,
    nextCursor,
    loading,
    refresh,
    loadMore,
    markOneRead,
    markAllRead,
  };
}