"use client";

import { addQuestionAIAction } from "@/actions/missions/add-question-ai.action";
import { regenerateSurveysAIAction } from "@/actions/missions/regenerate-surveys-AI-action";
import { updateMissionAction } from "@/actions/missions/update-mission-action";
import { updateSurveyQuestionsAction } from "@/actions/missions/update-survey-questions-action";
import {
  type Survey,
  useSurveysBuilder,
} from "@/context/surveys-builder-context";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { AddNewQuestionModal } from "./modals/add-new-question-modal";

interface HeaderSurveysProps {
  surveyId: string;
  missionId: string;
  problemSummary: string;
  objectives: string;
  assumptions: string;
  audiences: Record<string, string | number>;
}

export function HeaderSurveys({
  surveyId,
  missionId,
  problemSummary,
  objectives,
  assumptions,
  audiences,
}: HeaderSurveysProps) {
  const t = useI18n();
  const { toast } = useToast();
  const { setSurveys } = useSurveysBuilder();
  const [showAddModal, setShowAddModal] = useState(false);
  const updateSurveyQuestions = useAction(updateSurveyQuestionsAction, {
    onSuccess: () => {
      toast({
        title: t("missions.surveys.saveDraftSuccess"),
        description: t("missions.surveys.saveDraftSuccessDescription"),
      });
    },
    onError: () => {
      toast({
        title: t("missions.surveys.saveDraftError"),
        description: t("missions.surveys.saveDraftErrorDescription"),
        variant: "destructive",
      });
    },
  });

  const regenerateSurveysAI = useAction(regenerateSurveysAIAction, {
    onSuccess: ({ data }) => {
      setSurveys(data?.data?.questions as unknown as Survey);
      toast({
        title: t("missions.surveys.saveDraftSuccess"),
        description: t("missions.surveys.saveDraftSuccessDescription"),
      });
    },
    onError: () => {
      toast({
        title: t("missions.surveys.saveDraftError"),
        description: t("missions.surveys.saveDraftErrorDescription"),
        variant: "destructive",
      });
    },
  });

  const addQuestionAI = useAction(addQuestionAIAction, {
    onSuccess: ({ data }) => {
      setSurveys(data?.data?.questions as unknown as Survey);
      setShowAddModal(false);
      toast({
        title: t("missions.surveys.saveDraftSuccess"),
        description: t("missions.surveys.saveDraftSuccessDescription"),
      });
    },
    onError: () => {
      toast({
        title: t("missions.surveys.saveDraftError"),
        description: t("missions.surveys.saveDraftErrorDescription"),
        variant: "destructive",
      });
    },
  });

  const updateMission = useAction(updateMissionAction, {
    onSuccess: () => {
      toast({
        title: t("missions.surveys.published"),
        description: t("missions.surveys.publishedDescription"),
      });
    },
    onError: () => {
      toast({
        title: t("missions.surveys.publishedError"),
        description: t("missions.surveys.publishedErrorDescription"),
        variant: "destructive",
      });
    },
  });

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-medium text-gray-800 dark:text-white">
          {t("missions.surveys.title")}
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              updateMission.execute({
                missionId: missionId,
                status: "on hold",
              });
            }}
            className="flex items-center "
            disabled={updateMission.status === "executing"}
          >
            {updateMission.status === "executing" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t("missions.surveys.publishSurvey")
            )}
          </Button>
        </div>
      </div>
      <div className="flex mt-3 gap-2">
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          {t("missions.surveys.addNewQuestion.add")}
        </Button>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2"
          onClick={() => {
            regenerateSurveysAI.execute({
              surveyId,
              problemSummary,
              objectives,
              assumptions,
              audiences,
            });
          }}
          disabled={regenerateSurveysAI.status === "executing"}
        >
          {regenerateSurveysAI.status === "executing" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <RefreshCw size={14} />
              Regenerate questions with AI
            </>
          )}
        </Button>
      </div>
      <AddNewQuestionModal
        isOpen={showAddModal}
        onOpenChange={setShowAddModal}
        updateSurveyQuestions={(surveys) => {
          updateSurveyQuestions.execute({
            surveyId,
            questions: surveys,
          });
        }}
        isLoadingUpdate={updateSurveyQuestions.status === "executing"}
        addQuestionAI={async (userPrompt) => {
          await addQuestionAI.executeAsync({
            surveyId,
            problemSummary,
            objectives,
            assumptions,
            audiences,
            userPrompt,
          });
        }}
        isLoadingAddQuestionAI={addQuestionAI.status === "executing"}
      />
    </header>
  );
}
