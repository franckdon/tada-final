"use client";

import { Badge } from "@tada/ui/components/badge";
import { Button } from "@tada/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tada/ui/components/dropdown-menu";
import { MoreHorizontal, Send, Trash2, Calendar, Pencil } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import { deleteNotificationCampaignAction } from "@/actions/notifications/delete-notification-campaign-action";
import { sendNotificationCampaignAction } from "@/actions/notifications/send-notification-campaign-action";
import { scheduleNotificationCampaignAction } from "@/actions/notifications/schedule-notification-campaign-action";

import { EditNotificationCampaignModal } from "@/components/notifications/edit-notification-campaign-modal";
import { useState } from "react";

export function NotificationCampaignCard({ campaign }: { campaign: any }) {
  const [editOpen, setEditOpen] = useState(false);

  const del = useAction(deleteNotificationCampaignAction, {
    onSuccess: () => {
      toast({ title: "Campagne supprimée" });
      window.location.reload();
    },
    onError: () =>
      toast({ title: "Erreur suppression", variant: "destructive" }),
  });

  const send = useAction(sendNotificationCampaignAction, {
    onSuccess: ({ data }) => {
      const count = (data as any)?.data?.recipients ?? 0;
      toast({ title: "Envoi lancé", description: `${count} destinataire(s)` });
      window.location.reload();
    },
    onError: () => toast({ title: "Erreur envoi", variant: "destructive" }),
  });

  const schedule = useAction(scheduleNotificationCampaignAction, {
    onSuccess: () => {
      toast({ title: "Campagne programmée" });
      window.location.reload();
    },
    onError: () => toast({ title: "Erreur schedule", variant: "destructive" }),
  });

  const status = campaign.status;

  const channels = campaign.channels ?? {};
  const channelLabel =
    [channels.push ? "push" : null, channels.web ? "web" : null]
      .filter(Boolean)
      .join(" + ") || "—";

  return (
    <>
      <EditNotificationCampaignModal
        open={editOpen}
        onOpenChange={setEditOpen}
        campaign={campaign}
        onUpdated={() => window.location.reload()}
      />
      <div className="py-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-medium truncate">{campaign.title}</div>
            <Badge variant="secondary">{status}</Badge>
            <Badge variant="outline">{channelLabel}</Badge>
          </div>
          {campaign.body ? (
            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
              {campaign.body}
            </div>
          ) : null}
          <div className="text-xs text-gray-400 mt-2">
            Recipients: {campaign._count?.recipients ?? 0}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                send.execute({ campaignId: campaign.id });
              }}
              disabled={
                send.isExecuting || ["sending", "sent"].includes(status)
              }
            >
              <Send className="h-4 w-4 mr-2" />
              Envoyer maintenant
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                // exemple: schedule à +10min (tu remplaceras par un datepicker)
                const d = new Date(Date.now() + 10 * 60 * 1000);
                schedule.execute({ campaignId: campaign.id, scheduledAt: d });
              }}
              disabled={
                schedule.isExecuting || ["sending", "sent"].includes(status)
              }
            >
              <Calendar className="h-4 w-4 mr-2" />
              Programmer (ex +10min)
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setEditOpen(true);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Éditer
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                del.execute({ campaignId: campaign.id });
              }}
              disabled={del.isExecuting || status !== "draft"}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer (draft)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
