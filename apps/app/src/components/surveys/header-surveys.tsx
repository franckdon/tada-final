// src/components/surveys/header-surveys.tsx
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
import { useMemo, useState } from "react";
import { AddNewQuestionModal } from "./modals/add-new-question-modal";
import { countSurveyQuestions } from "@/lib/surveys/count-questions";

interface HeaderSurveysProps {
  surveyId: string;
  missionId: string;
  problemSummary: string;
  objectives: string;
  assumptions: string;
  audiences: Record<string, string | number>;
  isAiMode: boolean;
  redirectTo: string;

  // ✅ injectés depuis le server component
  questionsLimit: number;
  initialQuestionsCount: number;
}

export function HeaderSurveys({
  surveyId,
  missionId,
  problemSummary,
  objectives,
  assumptions,
  audiences,
  isAiMode = false,
  redirectTo,
  questionsLimit,
  initialQuestionsCount,
}: HeaderSurveysProps) {
  const t = useI18n();
  const { toast } = useToast();
  const { surveys, setSurveys } = useSurveysBuilder();

  const [showAddModal, setShowAddModal] = useState(false);

  const currentCount = useMemo(() => {
    return surveys?.pages
      ? countSurveyQuestions(surveys)
      : initialQuestionsCount;
  }, [surveys, initialQuestionsCount]);

  const quotaReached = currentCount >= questionsLimit;

  const updateSurveyQuestions = useAction(updateSurveyQuestionsAction, {
    onSuccess: () => {
      toast({
        title: t("missions.surveys.saveDraftSuccess"),
        description: t("missions.surveys.saveDraftSuccessDescription"),
      });
    },
    onError: ({ error }) => {
      toast({
        title: t("missions.surveys.saveDraftError"),
        description:
          (error as any)?.serverError ??
          t("missions.surveys.saveDraftErrorDescription"),
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
    onError: ({ error }) => {
      toast({
        title: t("missions.surveys.saveDraftError"),
        description:
          (error as any)?.serverError ??
          t("missions.surveys.saveDraftErrorDescription"),
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
    onError: ({ error }) => {
      toast({
        title: t("missions.surveys.saveDraftError"),
        description:
          (error as any)?.serverError ??
          t("missions.surveys.saveDraftErrorDescription"),
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
    onError: ({ error }) => {
      toast({
        title: t("missions.surveys.publishedError"),
        description:
          (error as any)?.serverError ??
          t("missions.surveys.publishedErrorDescription"),
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

        <div className="text-xs text-gray-500 dark:text-gray-300">
          {currentCount}/{questionsLimit} questions
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              updateMission.execute({ missionId, status: "on hold" });
            }}
            className="flex items-center"
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

      {isAiMode && (
        <div className="mt-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100">
          {t("missions.surveys.aiInfoBanner") ??
            "Les questions ci-dessous ont été générées automatiquement à partir de votre brief (problématique, objectifs, hypothèses et ciblage). Vous pouvez les modifier, réorganiser ou en ajouter de nouvelles librement."}
        </div>
      )}

      <div className="flex mt-3 gap-2">
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2"
          disabled={quotaReached}
          title={
            quotaReached
              ? `Quota atteint (${currentCount}/${questionsLimit})`
              : undefined
          }
        >
          <Plus size={14} />
          {t("missions.surveys.addNewQuestion.add")}
        </Button>

        {isAiMode && (
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
        )}
      </div>

      <AddNewQuestionModal
        isOpen={showAddModal}
        onOpenChange={setShowAddModal}
        questionsLimit={questionsLimit}
        currentQuestionsCount={currentCount}
        updateSurveyQuestions={(next) => {
          updateSurveyQuestions.execute({ surveyId, questions: next });
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
        isAiMode={isAiMode}
      />
    </header>
  );
}
