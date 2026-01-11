"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/utils";
import { useCurrentLocale, useI18n } from "@/locales/client";
import { MissionStatus } from "./mission-status";
import type { Mission } from "./type";
import { FullScreenLoader } from "@tada/ui/components/customs/fullscreen-loader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tada/ui/components/dropdown-menu";
import { Button } from "@tada/ui/components/button";
import {
  Loader2,
  MoreHorizontal,
  Users,
  UserPlus,
  CloudUpload,
  CloudDownload,
  EyeIcon,
  CheckCircle,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import { publishMissionAction } from "@/actions/missions/publish-mission-action";
import { updateMissionStatusAction } from "@/actions/missions/update-mission-status-action";
import { MissionPublishStatus } from "./mission-publish-status";
import { MissionAssignmentModal } from "./mission-assignment-modal";
import { AssignedContributorsView } from "./assigned-contributors";
import { PublishMissionModal } from "./modals/publish-mission-modal";

interface MissionCardProps {
  mission: Mission & { submissions: number; percentage: number };
}

export function MissionCard({ mission }: MissionCardProps) {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isAssignedContributorsModalOpen, setIsAssignedContributorsModalOpen] =
    useState(false);
  const [isPublishMissionModalOpen, setIsPublishMissionModalOpen] =
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

  const updateMissionStatus = useAction(updateMissionStatusAction, {
    onSuccess: ({ data }) => {
      const message = data?.data?.isUpdate
        ? "Insights mis à jour avec succès"
        : "Mission terminée et insights générés avec succès";

      toast({
        title: "Statut mis à jour",
        description: message,
      });

      window.location.reload();
    },
    onError: (error) => {
      console.log("error", error);
      toast({
        title: "Erreur lors de la mise à jour",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const handleClick = () => {
    setIsLoading(true);
    router.push(`/missions/${mission.id}`);
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
                {t("missions.submissions", {
                  submissions: mission.submissions,
                })}
              </span>
              {mission.updatedAt && (
                <span className="text-xs text-gray-400 mt-2 dark:text-gray-100">
                  {timeAgo(new Date(mission.updatedAt), currentLocale)}
                </span>
              )}
            </div>

            <div className="flex flex-col items-end justify-start">
              <MissionPublishStatus mission={mission} />

              <div className="flex flex-col">
                {mission.updatedAt && (
                  <span className="text-gray-600 text-sm dark:text-gray-100 mt-2">
                    {timeAgo(new Date(mission.updatedAt), currentLocale)}
                  </span>
                )}
                {mission.updatedType && (
                  <span className="text-xs text-gray-400 mt-2 dark:text-gray-100">
                    {t(
                      `missions.updated_type.${mission.updatedType}` as keyof typeof t
                    )}
                  </span>
                )}
              </div>

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

                  {mission.isPublish ? (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          publishMission.execute({
                            missionId: mission.id,
                            isPublish: false,
                            status: "on hold",
                          });
                        }}
                      >
                        <CloudDownload className="h-4 w-4 mr-2" />
                        Retirer
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/missions/${mission.id}/submissions`);
                        }}
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Voir les soumissions
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          updateMissionStatus.execute({
                            missionId: mission.id,
                            status: "completed",
                          });
                        }}
                        disabled={
                          updateMissionStatus.isExecuting ||
                          mission.status === "completed"
                        }
                      >
                        {updateMissionStatus.isExecuting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {mission.status === "completed"
                          ? "Mission déjà complétée"
                          : "Compléter la mission"}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPublishMissionModalOpen(true);
                      }}
                    >
                      <CloudUpload className="h-4 w-4 mr-2" />
                      Publier
                    </DropdownMenuItem>
                  )}
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
      <PublishMissionModal
        isOpen={isPublishMissionModalOpen}
        onClose={(isAssign?: boolean) => {
          setIsPublishMissionModalOpen(false);
          if (isAssign) setIsAssignmentModalOpen(true);
          setTimeout(() => {
            router.refresh();
          }, 100);
        }}
        mission={mission}
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
