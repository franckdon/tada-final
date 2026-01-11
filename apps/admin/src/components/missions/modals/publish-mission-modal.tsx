"use client";

import { useState } from "react";
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

interface PublishMissionModalProps {
  isOpen: boolean;
  onClose: (isAssign?: boolean) => void;
  mission: Mission;
  trigger?: React.ReactNode;
}

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
          <h2 className="text-2xl font-bold ">Prévisualisation</h2>
          
          <Button className="mb-2">
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
  goNext,
}: {
  mission: Mission;
  goNext: () => void;
}) => {
  const t = useI18n();
  const form = useForm<
    z.infer<typeof createMissionConfigForContributorsSchema>
  >({
    resolver: zodResolver(createMissionConfigForContributorsSchema),
    defaultValues: {
      description: mission?.problemSummary || "",
      gain: 0,
      title: mission?.name,
      duration: 0,
    },
  });

  return (
    <div>
      <Form {...form}>
        <ConfigMissionForContributorsForm
          missionId={mission.id}
          goNext={goNext}
        />
      </Form>
    </div>
  );
};

export function PublishMissionModal({
  isOpen,
  onClose,
  mission,
  trigger,
}: PublishMissionModalProps) {
  const [step, setStep] = useState<"resume" | "config">("resume");

  const t = useI18n();
  // Function to change step
  const changeStep = (newStep: "resume" | "config") => {
    setStep(newStep);
  };

  // Function to go to next step
  const goToNextStep = () => {
    switch (step) {
      case "resume":
        changeStep("config");
        break;
      case "config":
        onClose(true);
        break;
    }
  };

  // Function to go to previous step
  const goToPreviousStep = () => {
    switch (step) {
      case "config":
        changeStep("resume");
        break;
      default:
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center justify-between text-xl font-semibold">
            <div className="flex items-center space-x-2">
              <span>{t("missions.publish.titleModalPublishMission")}</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        <SurveysBuilderProvider
          defaultSurvey={(mission as any).survey[0]?.questions}
        >
          <div className="relative">
            <div className="p-6">
              {step === "resume" ? <ResumeStep mission={mission} /> : <></>}
              {step === "config" ? (
                <ConfigStep mission={mission} goNext={goToNextStep} />
              ) : (
                <></>
              )}
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
                  >
                    {t("missions.publish.form.previous")}
                  </Button>
                )}

                {step === "resume" && (
                  <Button type="button" onClick={goToNextStep}>
                    {t("missions.publish.form.next")}
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
