// src/components/.../modals/publish-mission-modal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@tada/ui/components/dialog";
import { useI18n } from "@/locales/client";
import { AudiencesFilterProvider } from "@/context/audiences-filter-context";
import { MissionBrief } from "@/components/surveys/mission-brief";
import { Mission } from "@prisma/client";
import { SurveyShow } from "@/components/ui/survey-show";
import { SurveysBuilderProvider } from "@/context/surveys-builder-context";
import Link from "next/link";
import { ConfigMissionForContributorsForm } from "../forms/config-mission-for-contributors-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createMissionConfigForContributorsSchema } from "@/actions/missions/schema";
import { Form } from "@tada/ui/components/form";

import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";

import { publishMissionAction } from "@/actions/missions/publish-mission-action";
import {
  autoAssignMissionAction,
  previewAutoAssignMissionAction,
} from "@/actions/missions/auto-assign-mission-action";

import { Checkbox } from "@tada/ui/components/checkbox";
import { Loader2, User } from "lucide-react";
import { ScrollArea } from "@tada/ui/components/scroll-area";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tada/ui/components/avatar";
import { Badge } from "@tada/ui/components/badge";
import { Separator } from "@tada/ui/components/separator";

interface PublishMissionModalProps {
  isOpen: boolean;
  onClose: (isAssign?: boolean) => void;
  mission: Mission;
  trigger?: React.ReactNode;
}

type Step = "resume" | "config" | "publish";

const ResumeStep = ({ mission }: { mission: Mission }) => {
  const t = useI18n();

  return (
    <div className="grid grid-cols-3">
      <div className="col-span-3 md:col-span-1">
        <AudiencesFilterProvider>
          <div className="bg-white dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
            <MissionBrief
              mission={{
                id: mission.id,
                name: mission.name,
                orgId: mission.organizationId || "",
                problemSummary: mission.problemSummary || "",
                objectives: mission.objectives || "",
                assumptions: mission.assumptions || "",
                targetSampleSize: mission.targetSampleSize || 0,
                audiences:
                  (mission.audiences as Record<string, string | number>) || {},
              }}
              isPublish={true}
            />
          </div>
        </AudiencesFilterProvider>
      </div>

      <div className="col-span-3 md:col-span-2 flex-1 p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h2 className="text-2xl font-bold">Prévisualisation</h2>

          <Button className="mb-2" type="button">
            <Link href={`/missions/${mission.id}/surveys`} target="_blank">
              {t("missions.publish.updateSurveys")}
            </Link>
          </Button>
        </div>

        <SurveyShow />
      </div>
    </div>
  );
};

const ConfigStep = ({
  mission,
  onSaved,
}: {
  mission: Mission;
  onSaved: () => void;
}) => {
  const form = useForm<
    z.infer<typeof createMissionConfigForContributorsSchema>
  >({
    resolver: zodResolver(createMissionConfigForContributorsSchema),
    defaultValues: {
      title: mission?.name ?? "",
      description: mission?.problemSummary ?? "",
      gain: 0,
      duration: 0,
      deadline: null,
      targetSampleSize: mission?.targetSampleSize ?? 0,
      imageUrl: null,
      missionId: mission.id,
    },
  });

  return (
    <div>
      <Form {...form}>
        <ConfigMissionForContributorsForm
          missionId={mission.id}
          goNext={onSaved}
        />
      </Form>
    </div>
  );
};

type PreviewContributor = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export function PublishMissionModal({
  isOpen,
  onClose,
  mission,
  trigger,
}: PublishMissionModalProps) {
  const [step, setStep] = useState<Step>("resume");
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);

  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewList, setPreviewList] = useState<PreviewContributor[]>([]);

  const t = useI18n();

  const publishMission = useAction(publishMissionAction, {
    onError: (error) => {
      console.error("publish onError (full)", error);
      toast({
        title: "Erreur publication",
        description:
          (error as any)?.serverError ?? (error as any)?.message ?? "",
        variant: "destructive",
      });
    },
  });

  const autoAssign = useAction(autoAssignMissionAction, {
    onError: (error) => {
      console.error("autoAssign onError (full)", error);
      toast({
        title: "Auto-assign échoué",
        description: "La mission est publiée mais l’attribution auto a échoué.",
        variant: "destructive",
      });
    },
  });

  const previewAuto = useAction(previewAutoAssignMissionAction, {
    onSuccess: ({ data }) => {
      const count = data?.data?.candidatesCount ?? 0;
      const list = (data?.data?.previewList ?? []) as PreviewContributor[];
      setPreviewCount(count);
      setPreviewList(list);
    },
    onError: (error) => {
      console.error("preview auto error", error);
      setPreviewCount(null);
      setPreviewList([]);
    },
  });

  const isBusy = publishMission.isExecuting || autoAssign.isExecuting;
  const isPreviewLoading = previewAuto.isExecuting;

  // ✅ preview uniquement au step "publish"
  useEffect(() => {
    if (!isOpen) return;
    if (step !== "publish") return;

    if (!autoAssignEnabled) {
      setPreviewCount(null);
      setPreviewList([]);
      return;
    }

    previewAuto.execute({ missionId: mission.id, previewTake: 80 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, step, autoAssignEnabled, mission.id]);

  const handlePublish = async () => {
    console.log("[Publish] start", {
      missionId: mission.id,
      autoAssignEnabled,
      step,
    });

    const publishRes = await publishMission.executeAsync({
      missionId: mission.id,
      isPublish: true,
    });

    const anyErr =
      (publishRes as any)?.serverError ||
      (publishRes as any)?.fetchError ||
      (publishRes as any)?.validationErrors ||
      (publishRes as any)?.actionError;

    if (anyErr) {
      console.error("[Publish] publish error details", anyErr);
      toast({
        title: t("missions.publish.error"),
        description:
          typeof anyErr === "string" ? anyErr : JSON.stringify(anyErr, null, 2),
        variant: "destructive",
      });
      return;
    }

    if (autoAssignEnabled) {
      const assignRes = await autoAssign.executeAsync({
        missionId: mission.id,
      });

      const assignErr =
        (assignRes as any)?.serverError ||
        (assignRes as any)?.fetchError ||
        (assignRes as any)?.validationErrors ||
        (assignRes as any)?.actionError;

      if (assignErr) {
        console.error("[Publish] autoAssign error details", assignErr);
        toast({
          title: "Auto-assign échoué",
          description:
            "La mission est publiée mais l’attribution auto a échoué.",
          variant: "destructive",
        });
        onClose(false);
        return;
      }

      const assigned = (assignRes as any)?.data?.data?.assignedCount ?? 0;
      toast({
        title: "Mission publiée",
        description: `Attribution automatique : ${assigned} contributeur(s) assigné(s).`,
      });
      onClose(false);
      return;
    }

    toast({
      title: "Mission publiée",
      description: "Vous pouvez maintenant attribuer des contributeurs.",
    });
    onClose(true);
  };

  const goToNextStep = () => {
    if (step === "resume") setStep("config");
  };

  const goToPreviousStep = () => {
    if (step === "config") setStep("resume");
    if (step === "publish") setStep("config");
  };

  const previewLabel = useMemo(() => {
    if (!autoAssignEnabled) return "Auto-assign désactivé";
    if (isPreviewLoading) return "Calcul du matching...";
    if (previewCount === null) return "Matching non calculé";
    return `${previewCount} contributeur(s) matché(s)`;
  }, [autoAssignEnabled, isPreviewLoading, previewCount]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center justify-between text-xl font-semibold">
            <span>{t("missions.publish.titleModalPublishMission")}</span>
          </DialogTitle>
        </DialogHeader>

        <SurveysBuilderProvider
          defaultSurvey={(mission as any).surveys?.[0]?.questions}
        >
          <div className="relative">
            <div className="p-6">
              {step === "resume" ? <ResumeStep mission={mission} /> : null}

              {step === "config" ? (
                <ConfigStep
                  mission={mission}
                  onSaved={() => {
                    setStep("publish");
                    // optionnel: déclencher preview immédiat
                  }}
                />
              ) : null}

              {step === "publish" ? (
                <div className="mt-2 rounded-md border p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={autoAssignEnabled}
                      onCheckedChange={(v) => setAutoAssignEnabled(Boolean(v))}
                      disabled={isBusy}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium">
                          Attribution automatique après publication
                        </span>

                        <Badge variant="secondary" className="shrink-0">
                          {isPreviewLoading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              {previewLabel}
                            </span>
                          ) : (
                            previewLabel
                          )}
                        </Badge>
                      </div>

                      <span className="text-xs text-gray-500">
                        Assigne 100% des contributeurs matchés. Le preview
                        ci-dessous te permet de vérifier si les critères
                        matchent.
                      </span>
                    </div>
                  </div>

                  {autoAssignEnabled ? (
                    <>
                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Aperçu des contributeurs matchés
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isBusy || isPreviewLoading}
                            onClick={() =>
                              previewAuto.execute({
                                missionId: mission.id,
                                previewTake: 80,
                              })
                            }
                          >
                            {isPreviewLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Refresh
                              </>
                            ) : (
                              "Recalculer"
                            )}
                          </Button>
                        </div>

                        <ScrollArea className="h-[260px] rounded-md border">
                          <div className="p-3 space-y-2">
                            {isPreviewLoading ? (
                              <div className="flex items-center gap-2 text-sm text-gray-500 p-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Calcul en cours...
                              </div>
                            ) : previewList.length === 0 ? (
                              <div className="text-sm text-gray-500 p-2">
                                Aucun contributeur matché (ou preview vide).
                              </div>
                            ) : (
                              previewList.map((c) => (
                                <div
                                  key={c.id}
                                  className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-gray-50"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <Avatar className="h-9 w-9">
                                      <AvatarImage
                                        src={c.image ?? "/placeholder.svg"}
                                        alt={c.name}
                                      />
                                      <AvatarFallback>
                                        <User className="h-4 w-4" />
                                      </AvatarFallback>
                                    </Avatar>

                                    <div className="min-w-0">
                                      <div className="text-sm font-medium truncate">
                                        {c.name}
                                      </div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {c.email}
                                      </div>
                                    </div>
                                  </div>

                                  <Badge variant="outline" className="shrink-0">
                                    Match
                                  </Badge>
                                </div>
                              ))
                            )}
                          </div>
                        </ScrollArea>

                        {previewCount !== null &&
                        previewCount > previewList.length ? (
                          <div className="text-xs text-gray-500">
                            Affichage limité à {previewList.length} sur{" "}
                            {previewCount}.
                          </div>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 mb-6 p-6">
            <DialogFooter>
              <div className="space-x-4">
                {step !== "resume" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={isBusy}
                  >
                    {t("missions.publish.form.previous")}
                  </Button>
                )}

                {step === "resume" && (
                  <Button
                    type="button"
                    onClick={goToNextStep}
                    disabled={isBusy}
                  >
                    {t("missions.publish.form.next")}
                  </Button>
                )}

                {step === "publish" && (
                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={isBusy}
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Publication...
                      </>
                    ) : (
                      "Publier la mission"
                    )}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </div>
        </SurveysBuilderProvider>
      </DialogContent>
    </Dialog>
  );
}
