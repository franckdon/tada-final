"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/utils";
import { useCurrentLocale, useI18n } from "@/locales/client";
import { MissionStatus } from "./mission-status";
import { FullScreenLoader } from "@tada/ui/components/customs/fullscreen-loader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tada/ui/components/dropdown-menu";
import { Button } from "@tada/ui/components/button";
import { Loader2, MoreHorizontal, Users, UserPlus, Eye } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import { publishMissionAction } from "@/actions/missions/publish-mission-action";
import { MissionAssignmentModal } from "./mission-assignment-modal";
import { AssignedContributorsView } from "./assigned-contributors";
import { Mission } from "@prisma/client";

interface MissionCardProps {
  mission: Mission & { submissions: number; percentage: number };
}

export function MissionToSubmitCard({ mission }: MissionCardProps) {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isAssignedContributorsModalOpen, setIsAssignedContributorsModalOpen] =
    useState(false);

  const publishMission = useAction(publishMissionAction, {
    onSuccess: () => {
      toast({
        title: t("missions.publish.success"),
        description: t("missions.publish.successDescription"),
      });

      window.location.reload();
    },
    onError: (error) => {
      console.log("error", error);
      toast({
        title: t("missions.publish.error"),
        variant: "destructive",
      });
    },
  });

  const handleClick = () => {
    setIsLoading(true);
    // 🚨 CORRECTION : Pointer vers la nouvelle page de validation
    router.push(`/missions-to-validate/${mission.id}`);
  };

  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  return (
    <>
      {isLoading && <FullScreenLoader />}

      <div
        onClick={handleClick}
        className="flex items-center justify-between cursor-pointer border-b border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <div className="grid grid-cols-4 py-6 px-4 gap-4 w-full">
          <div className="flex flex-col col-span-2">
            <h2 className="font-medium text-gray-800 dark:text-gray-100">
              {mission.name}
            </h2>
            <div className="flex gap-2">
              {mission.status && <MissionStatus mission={mission} />}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-600 text-sm dark:text-gray-100">
              {t("missions.completion", { percentage: mission.percentage })}
            </span>
            {mission.createdAt && (
              <span className="text-xs text-gray-400 mt-2 dark:text-gray-100">
                {timeAgo(new Date(mission.createdAt), currentLocale)}
              </span>
            )}
          </div>

          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm dark:text-gray-100">
                {t("missions.lastSubmissions")}
              </span>
              {mission.updatedAt && (
                <span className="text-xs text-gray-400 mt-2 dark:text-gray-100">
                  {timeAgo(new Date(mission.updatedAt), currentLocale)}
                </span>
              )}
            </div>

            <div className="flex flex-col items-end justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    {publishMission.isExecuting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAssignmentModalOpen(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Attribuer à des contributeurs
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAssignedContributorsModalOpen(true);
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Voir les contributeurs assignés
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <MissionAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        missionId={mission.id}
        missionName={mission.name}
        isLoading={isAssigning}
      />

      <AssignedContributorsView
        isOpen={isAssignedContributorsModalOpen}
        onClose={() => setIsAssignedContributorsModalOpen(false)}
        missionId={mission.id}
        missionName={mission.name}
      />
    </>
  );
}
