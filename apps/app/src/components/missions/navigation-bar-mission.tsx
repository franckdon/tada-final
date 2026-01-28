"use client";

import { updateMissionAction } from "@/actions/missions/update-mission-action";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { cn } from "@tada/ui/lib/utils";
import {
  AreaChartIcon,
  ArrowLeftIcon,
  DatabaseIcon,
  FileText,
  PencilIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter, useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { MissionStatus } from "./mission-status";
import type { Mission } from "./type";

function normalizeStatus(s?: string | null) {
  return (s ?? "").trim().toLowerCase().replace(/[_-]/g, " ");
}

function isMissionEditable(status?: string | null) {
  const st = normalizeStatus(status);
  return st === "draft" || st === "on hold";
}

export function NavigationBarMission({
  mission,
  workspaceId,
}: {
  mission: Pick<Mission, "id" | "name" | "status">;
  workspaceId: string;
}) {
  const t = useI18n();
  const { toast } = useToast();
  const router = useRouter();

  // ✅ locale depuis l’URL: /[locale]/...
  const params = useParams() as { locale?: string };
  const locale = params?.locale ?? "fr";

  const canEdit = isMissionEditable(mission.status);

  const [currentTab, setCurrentTab] = useQueryState("tab", {
    shallow: false,
    defaultValue: "overview",
  });

  const updateMissionStatus = useAction(updateMissionAction, {
    onSuccess: () => {
      toast({
        title: t("missions.updated"),
        description: t("missions.updatedDescription"),
      });
    },
    onError: () => {
      toast({
        title: t("missions.updatedError"),
        description: t("missions.updatedErrorDescription"),
        variant: "destructive",
      });
    },
  });

  const navItems = [
    {
      id: "overview",
      label: t("missions.navigation.overview"),
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: "dashboards",
      label: t("missions.navigation.dashboards"),
      icon: <AreaChartIcon className="w-5 h-5" />,
    },
    {
      id: "submissions",
      label: t("missions.navigation.submissions"),
      icon: <DatabaseIcon className="w-5 h-5" />,
    },
  ];

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="mr-2 text-gray-500 hover:text-gray-700"
            onClick={() => router.push(`/${locale}/missions/${workspaceId}`)}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>

          <h1 className="text-xl font-bold text-gray-800">{mission.name}</h1>

          {mission.status && <MissionStatus mission={mission} />}
        </div>

        <div className="text-right flex gap-2">
          <Button
            variant="outline"
            className={cn(
              "flex items-center gap-2",
              !canEdit && "opacity-50 cursor-not-allowed",
            )}
            disabled={!canEdit}
            onClick={() => {
              if (!canEdit) {
                toast({
                  title:
                    locale === "fr" ? "Mission verrouillée" : "Mission locked",
                  description:
                    locale === "fr"
                      ? "Impossible de modifier une mission quand son statut est Live ou Complétée."
                      : "You can't edit a mission when it's Live or Completed.",
                  variant: "destructive",
                });
                return;
              }

              router.push(
                `/${locale}/missions/${workspaceId}/${mission.id}/surveys`,
              );
            }}
          >
            <PencilIcon className="w-5 h-5" />
            {t("missions.navigation.edit")}
          </Button>

          <div className="w-44">
            <Select
              value={mission.status ?? "draft"}
              onValueChange={(value) =>
                updateMissionStatus.execute({
                  missionId: mission.id,
                  revalidateRoute: `/${locale}/missions/${workspaceId}/${mission.id}`,
                  status: value as
                    | "draft"
                    | "live"
                    | "paused"
                    | "cancelled"
                    | "complete"
                    | "on hold",
                })
              }
            >
              <SelectTrigger className="w-full py-0">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="on hold">
                  {t("missions.status.on_hold")}
                </SelectItem>
                <SelectItem value="complete">
                  {t("missions.status.complete")}
                </SelectItem>
                <SelectItem value="draft">
                  {t("missions.status.draft")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* (Optionnel) message inline quand verrouillée */}
      {!canEdit && (
        <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          {locale === "fr"
            ? "Cette mission est verrouillée (modifiable uniquement en brouillon ou En attente)."
            : "This mission is locked (editable only in Draft or On hold)."}
        </div>
      )}

      <div className="flex mt-4 justify-start">
        {navItems.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              if (tab.id === "dashboards") {
                router.push(
                  `/${locale}/missions/${workspaceId}/${mission.id}/dashboard`,
                );
              } else {
                setCurrentTab(tab.id);
              }
            }}
            className={cn(
              "flex items-center text-sm transition-colors px-4 py-2 rounded-sm",
              "dark:bg-[#1D1D1D] dark:text-[#878787]",
              "bg-white text-gray-600",
              currentTab === tab.id &&
                "text-white dark:bg-[#2C2C2C] bg-primary",
            )}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
