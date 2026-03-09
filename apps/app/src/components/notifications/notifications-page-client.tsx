"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Loader2 } from "lucide-react";

import { Button } from "@tada/ui/components/button";
import { Badge } from "@tada/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
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

export function NotificationsPageClient() {
  const router = useRouter();
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  const {
    items,
    unreadCount,
    nextCursor,
    loading,
    loadMore,
    markOneRead,
    markAllRead,
  } = useNotifications(20, 15000);

  const stats = useMemo(() => {
    return {
      total: items.length,
      unread: unreadCount,
      read: Math.max(0, items.length - unreadCount),
    };
  }, [items.length, unreadCount]);

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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Consulte l’historique de tes notifications et marque-les comme lues.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          <Check className="w-4 h-4 mr-2" />
          Tout marquer comme lu
        </Button>
      </div>

      {/* <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total affiché
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Non lues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600">
              {stats.unread}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Lues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              {stats.read}
            </div>
          </CardContent>
        </Card>
      </div> */}

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Historique
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading && items.length === 0 ? (
            <div className="p-8 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Chargement des notifications...
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-sm text-gray-500">
              Aucune notification disponible.
            </div>
          ) : (
            <div className="divide-y">
              {items.map((notification) => {
                const isUnread = !notification.readAt;

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full text-left p-5 hover:bg-gray-50 transition-colors",
                      isUnread && "bg-blue-50/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={cn(
                              "text-sm font-semibold break-words",
                              isUnread && "text-blue-800",
                            )}
                          >
                            {notification.title}
                          </p>

                          {isUnread ? (
                            <Badge variant="outline">Nouveau</Badge>
                          ) : (
                            <Badge variant="secondary">Lu</Badge>
                          )}
                        </div>

                        {notification.body ? (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap break-words">
                            {notification.body}
                          </p>
                        ) : (
                          <p className="mt-2 text-sm text-gray-400 italic">
                            Aucun détail supplémentaire.
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                          <span>{formatFullDate(notification.createdAt)}</span>
                          <span>•</span>
                          <span>
                            {timeAgo(new Date(notification.createdAt))}
                          </span>

                          {notification.entityType && notification.entityId ? (
                            <>
                              <span>•</span>
                              <span>
                                {notification.entityType} #
                                {notification.entityId}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="p-4 border-t flex justify-end">
            <Button variant="outline" onClick={loadMore} disabled={!nextCursor}>
              Voir plus
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedNotification}
        onOpenChange={(open) => {
          if (!open) setSelectedNotification(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
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
              <div className="max-h-[65vh] overflow-y-auto rounded-md border p-4 text-sm text-gray-700 whitespace-pre-wrap break-words leading-6">
                {selectedNotification.body}
              </div>
            ) : (
              <div className="text-sm text-gray-500 rounded-md border p-4">
                Aucun détail supplémentaire.
              </div>
            )}

            <div className="flex justify-end gap-2 flex-wrap">
              {selectedNotification?.type ? (
                <Badge variant="secondary">{selectedNotification.type}</Badge>
              ) : null}

              {selectedNotification?.entityType ? (
                <Badge variant="outline">
                  {selectedNotification.entityType}
                </Badge>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
