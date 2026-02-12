"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@tada/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@tada/ui/components/dropdown";
import { ScrollArea } from "@tada/ui/components/scroll-area";
import { Badge } from "@tada/ui/components/badge";
import { cn } from "@tada/ui/lib/utils";
import { useAction } from "next-safe-action/hooks";

import { getNotificationsAction } from "@/actions/notifications/get-notifications-action";
import { markNotificationReadAction } from "@/actions/notifications/mark-notification-read-action";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  entityType: string | null;
  entityId: string | null;
  readAt: string | Date | null;
  createdAt: string | Date;
  data: any;
};

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l’instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `il y a ${days} j`;
}

export function NotificationsBell({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const getNotifs = useAction(getNotificationsAction, {
    onSuccess: ({ data }) => {
      if (!data) return;
      setItems(data.items as any);
      setUnreadCount(data.unreadCount ?? 0);
      setNextCursor(data.nextCursor ?? null);
    },
  });

  const markRead = useAction(markNotificationReadAction, {
    onSuccess: () => {
      // refresh lightweight
      getNotifs.execute({ limit: 10 });
    },
  });

  useEffect(() => {
    // précharge compteur au montage
    getNotifs.execute({ limit: 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // quand on ouvre, refresh pour être à jour
  useEffect(() => {
    if (open) getNotifs.execute({ limit: 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loading = getNotifs.isExecuting;

  const handleOpen = (v: boolean) => {
    setOpen(v);
  };

  const onMarkAll = async () => {
    await markRead.execute({ markAll: true });
  };

  const onMarkOne = async (id: string) => {
    await markRead.execute({ notificationId: id });
  };

  const onLoadMore = async () => {
    if (!nextCursor) return;
    const res = await getNotificationsAction({
      limit: 10,
      cursor: nextCursor,
    } as any);
    // NOTE: si ton safe-action n’est pas callable direct comme ça,
    // je te fais une version via useAction + state append.
    const data = (res as any)?.data;
    if (!data) return;
    setItems((prev) => [...prev, ...(data.items as any)]);
    setNextCursor(data.nextCursor ?? null);
    setUnreadCount(data.unreadCount ?? unreadCount);
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-blue-100",
            className,
          )}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-blue-600" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-96 p-0" align="end">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">Notifications</h3>
            {unreadCount > 0 ? (
              <Badge variant="secondary">{unreadCount} non lues</Badge>
            ) : null}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={onMarkAll}
            disabled={unreadCount === 0 || markRead.isExecuting}
          >
            {markRead.isExecuting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Tout lire
          </Button>
        </div>

        <ScrollArea className="max-h-80">
          {loading ? (
            <div className="p-6 text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Chargement...
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">
              Aucune notification pour le moment.
            </div>
          ) : (
            <div className="divide-y">
              {items.map((n) => {
                const isUnread = !n.readAt;
                const createdAt = new Date(n.createdAt);

                return (
                  <button
                    key={n.id}
                    className={cn(
                      "w-full text-left p-4 hover:bg-gray-50",
                      isUnread && "bg-blue-50/40",
                    )}
                    onClick={() => onMarkOne(n.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            isUnread && "text-blue-800",
                          )}
                        >
                          {n.title}
                        </p>
                        {n.body ? (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {n.body}
                          </p>
                        ) : null}
                      </div>
                      <span className="text-[11px] text-gray-500 shrink-0">
                        {timeAgo(createdAt)}
                      </span>
                    </div>

                    {isUnread ? (
                      <div className="mt-2">
                        <Badge className="text-[11px]" variant="outline">
                          Nouveau
                        </Badge>
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t bg-gray-50 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={!nextCursor}
          >
            Voir plus
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
