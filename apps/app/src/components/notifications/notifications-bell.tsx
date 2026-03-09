"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Loader2 } from "lucide-react";

import { Button } from "@tada/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@tada/ui/components/dropdown";
import { ScrollArea } from "@tada/ui/components/scroll-area";
import { Badge } from "@tada/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { cn } from "@tada/ui/lib/utils";

import {
  useNotifications,
  type NotificationItem,
} from "@/hooks/use-notifications";

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

function formatFullDate(date: string | Date) {
  return new Date(date).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function NotificationsBell({ className }: { className?: string }) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  const {
    items,
    unreadCount,
    nextCursor,
    loading,
    refresh,
    loadMore,
    markOneRead,
    markAllRead,
  } = useNotifications(10, 10000);

  useEffect(() => {
    if (open) {
      refresh();
    }
  }, [open, refresh]);

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.readAt) {
      await markOneRead(notification.id);
    }

    if (notification.entityType && notification.entityId) {
      switch (notification.entityType) {
        case "mission":
          router.push(`/missions/${notification.entityId}`);
          return;

        case "invoice":
          router.push(`/invoices/${notification.entityId}`);
          return;

        case "workspace":
          router.push(`/workspaces/${notification.entityId}`);
          return;

        default:
          break;
      }
    }

    setSelectedNotification(notification);
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
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
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              <Check className="w-4 h-4 mr-2" />
              Tout lire
            </Button>
          </div>

          <ScrollArea className="max-h-80">
            {loading && items.length === 0 ? (
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
                        "w-full text-left p-4 hover:bg-gray-50 transition-colors",
                        isUnread && "bg-blue-50/40",
                      )}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-sm font-medium line-clamp-1 break-words",
                              isUnread && "text-blue-800",
                            )}
                          >
                            {n.title}
                          </p>

                          {n.body ? (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2 break-words whitespace-pre-wrap">
                              {n.body}
                            </p>
                          ) : null}
                        </div>

                        <span className="text-[11px] text-gray-500 shrink-0">
                          {timeAgo(createdAt)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        {isUnread ? (
                          <Badge className="text-[11px]" variant="outline">
                            Nouveau
                          </Badge>
                        ) : null}

                        {(n.body?.length ?? 0) > 120 ? (
                          <span className="text-[11px] text-blue-600">
                            Cliquer pour lire
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="p-3 border-t bg-gray-50 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false);
                router.push("/notifications");
              }}
            >
              Voir tout
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={loadMore}
              disabled={!nextCursor}
            >
              Voir plus
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={!!selectedNotification}
        onOpenChange={(value) => {
          if (!value) setSelectedNotification(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="pr-6 break-words">
              {selectedNotification?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-xs text-gray-500">
              {selectedNotification?.createdAt
                ? formatFullDate(selectedNotification.createdAt)
                : ""}
            </div>

            {selectedNotification?.body ? (
              <div className="max-h-[60vh] overflow-y-auto rounded-md border p-4 text-sm text-gray-700 whitespace-pre-wrap break-words leading-6">
                {selectedNotification.body}
              </div>
            ) : (
              <div className="text-sm text-gray-500 rounded-md border p-4">
                Aucun détail supplémentaire.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
