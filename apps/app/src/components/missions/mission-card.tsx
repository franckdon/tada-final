"use client";

import { timeAgo } from "@/lib/utils";
import { useCurrentLocale, useI18n } from "@/locales/client";
import Link from "next/link";
import { MissionStatus } from "./mission-status";
import MissionPermissionsModal from "./mission-permissions-modal";
import { useMemo, useState } from "react";
import { Mission } from "./type";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import { duplicateMissionAction } from "@/actions/missions/duplicate-mission-action";
import { Copy, Trash2 } from "lucide-react";
import { Button } from "@tada/ui/components/button";
import { Icons } from "../icons";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@tada/ui/components/dialog";

interface MissionCardProps {
  mission: Mission & { submissions: number; percentage: number };
  orgId: string;
  workspaceId?: string;
  onMissionDeleted?: (id: string) => void;
}

export function MissionCard({
  mission,
  orgId,
  workspaceId,
  onMissionDeleted,
}: MissionCardProps) {
  const t = useI18n();
  const router = useRouter();
  const currentLocale = useCurrentLocale();
  const [isDuplicateLoading, setIsDuplicateLoading] = useState(false);

  const pureMission = useMemo(() => {
    const { submissions, percentage, ...rest } = mission;
    return rest;
  }, [mission]);

  const duplicateMission = useAction(duplicateMissionAction, {
    onSuccess: async ({ data }) => {
      setIsDuplicateLoading(true);
      await router.push(`/missions/${workspaceId}/${data?.duplicationId}`);
      toast({
        title: t("missions.duplicate.success"),
        description: t("missions.duplicate.descriptionSuccess"),
      });
    },
    onError: () => {
      toast({
        title: t("missions.duplicate.error"),
        description: t("missions.duplicate.descriptionError"),
        variant: "destructive",
      });
      setIsDuplicateLoading(false);
    },
  });

  const canDelete = mission.status === "draft" || mission.status === "on hold";

  if (isDuplicateLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-white/80 dark:bg-black/80 flex flex-col items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-gray-700 dark:text-gray-200" />
        <span className="text-sm text-gray-700 mt-1 font-light">
          {t("missions.duplicate.redirect")}
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[4fr,3fr,3fr,3fr,auto] items-center px-5 py-3 gap-4 text-sm">
      {/* Col 1 : Nom + statut (aligné sur "Mission") */}
      <Link
        href={`/missions/${workspaceId}/${mission.id}`}
        className="flex flex-col text-left"
      >
        <h2 className="font-medium text-gray-800 dark:text-gray-100">
          {mission.name}
        </h2>
        {mission.status && (
          <div className="mt-1">
            <MissionStatus mission={mission} />
          </div>
        )}
      </Link>

      {/* Col 2 : Progress (aligné sur "Progress") */}
      <Link
        href={`/missions/${workspaceId}/${mission.id}`}
        className="flex flex-col items-center text-center"
      >
        <span className="text-gray-700 dark:text-gray-100">
          {t("missions.completion", { percentage: mission.percentage })}
        </span>
        {mission.createdAt && (
          <span className="text-xs text-gray-400 mt-1 dark:text-gray-300">
            {timeAgo(new Date(mission.createdAt), currentLocale)}
          </span>
        )}
      </Link>

      {/* Col 3 : Submissions (aligné sur "Submissions") */}
      <Link
        href={`/missions/${workspaceId}/${mission.id}`}
        className="flex flex-col items-center text-center"
      >
        <span className="text-gray-700 dark:text-gray-100">
          {t("missions.submissions", {
            submissions: mission.submissions,
          })}
        </span>
        {mission.updatedAt && (
          <span className="text-xs text-gray-400 mt-1 dark:text-gray-300">
            {timeAgo(new Date(mission.updatedAt), currentLocale)}
          </span>
        )}
      </Link>

      {/* Col 4 : Last update (aligné sur "Last update") */}
      <Link
        href={`/missions/${workspaceId}/${mission.id}`}
        className="flex flex-col items-center text-center"
      >
        {mission.updatedAt && (
          <span className="text-gray-700 dark:text-gray-100">
            {timeAgo(new Date(mission.updatedAt), currentLocale)}
          </span>
        )}
        {mission.updatedType && (
          <span className="text-xs text-gray-400 mt-1 dark:text-gray-300">
            {t(`missions.updated_type.${mission.updatedType}` as any) as string}
          </span>
        )}
      </Link>

      {/* Col 5 : Actions (aligné sur "Actions") */}
      <div className="flex items-center justify-center gap-2">
        {/* Duplicate */}
        <Button
          size="icon"
          variant="outline"
          onClick={() =>
            duplicateMission.execute({ missionId: pureMission.id })
          }
        >
          {duplicateMission?.isExecuting ? (
            <Icons.spinner className="h-4 w-4 animate-spin" />
          ) : (
            <Copy size={18} />
          )}
        </Button>

        {/* Permissions */}
        {/* <MissionPermissionsModal orgId={orgId} mission={pureMission as any} /> */}

        {/* Delete avec Dialog */}
        <DeleteMissionDialog
          missionId={mission.id}
          missionName={mission.name}
          workspaceId={workspaceId}
          canDelete={canDelete}
          onDeleted={onMissionDeleted}
        />
      </div>
    </div>
  );
}

/**
 * Dialog de confirmation de suppression de mission
 */
function DeleteMissionDialog({
  missionId,
  missionName,
  workspaceId,
  canDelete,
  onDeleted,
}: {
  missionId: string;
  missionName: string;
  workspaceId?: string;
  canDelete: boolean;
  onDeleted?: (id: string) => void;
}) {
  const t = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!workspaceId || !canDelete || isDeleting) return;

    try {
      setIsDeleting(true);

      const res = await fetch(
        `/api/workspaces/${workspaceId}/missions/${missionId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast({
          title: t("missions.delete.errorTitle") || "Suppression impossible",
          description:
            data.error ||
            t("missions.delete.errorMessage") ||
            "Vous ne pouvez supprimer que les missions en brouillon ou en pause.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t("missions.delete.successTitle") || "Mission supprimée",
        description:
          t("missions.delete.successMessage") ||
          "La mission a été supprimée avec succès.",
      });

      onDeleted?.(missionId);

      setOpen(false);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !isDeleting && setOpen(value)}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          disabled={!canDelete}
          className={
            !canDelete
              ? "border-gray-200 text-gray-300 dark:border-gray-700 dark:text-gray-600 cursor-not-allowed"
              : "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
          }
          title={
            !canDelete
              ? t("missions.delete.disabledTooltip") ||
                "Seules les missions en draft ou on hold peuvent être supprimées."
              : t("missions.delete.label") || "Supprimer"
          }
        >
          {isDeleting ? (
            <Icons.spinner className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 size={18} />
          )}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("missions.delete.title") || "Supprimer la mission"}
          </DialogTitle>
          <DialogDescription>
            {t("missions.delete.description") ||
              `Voulez-vous vraiment supprimer la mission « ${missionName} » ? Cette action est irréversible.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            {t("common.cancel") || "Annuler"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting
              ? t("common.deleting") || "Suppression…"
              : t("missions.delete.confirmCta") || "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
