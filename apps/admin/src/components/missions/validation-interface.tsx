// src/components/missions/validation-interface.tsx
"use client";

import { validateMissionAction } from "@/actions/missions/validation-mission-action";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { Textarea } from "@tada/ui/components/textarea";
import { Check, Edit, Loader2, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ValidationStatus = "ok" | "pending" | "issue";

type MissionValidationDTO = {
  id: string;
  name: string;
  problemSummary: string | null;
  objectives: string | null;
  audiences: unknown | null;
  targetSampleSize: number | null;
  validationStatus: string | null;
  validationComment: string | null;
  surveys: Array<{
    id: string;
    name: string;
    description: string | null;
    questions: unknown | null;
  }>;
};

interface ValidationInterfaceProps {
  mission: MissionValidationDTO;
}

const STATUS = {
  approved: "approved",
  rejected: "rejected",
  modification_requested: "modification_requested",
} as const;

function prettyJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function ValidationInterface({ mission }: ValidationInterfaceProps) {
  const t = useI18n();
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "fr";
  const { toast } = useToast();

  const [comment, setComment] = useState(mission.validationComment || "");

  const [briefStatus, setBriefStatus] = useState<ValidationStatus>("pending");
  const [questionnaireStatus, setQuestionnaireStatus] =
    useState<ValidationStatus>("pending");

  const questionnaireText = useMemo(() => {
    if (!mission.surveys?.length)
      return t("missionsToSubmit.validation.questionnaire_placeholder");

    // Exemple simple: concatène les surveys (tu peux améliorer ensuite)
    return mission.surveys
      .map((s, idx) => {
        const header = `Survey ${idx + 1} — ${s.name}\n`;
        const q = s.questions ? prettyJson(s.questions) : t("common.no_data");
        return `${header}${q}`;
      })
      .join("\n\n-----------------\n\n");
  }, [mission.surveys, t]);

  const validateMission = useAction(validateMissionAction, {
    onSuccess: (data) => {
      const status = data.data?.mission.validationStatus;
      toast({
        title: t("missionsToSubmit.validation.success"),
        description: `Mission marquée comme ${status}.`,
      });
      router.push(`/${locale}/missions-to-validate`);
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: t("missionsToSubmit.validation.error"),
        description: t("common.generic_error"),
        variant: "destructive",
      });
    },
  });

  const handleValidationAction = (
    validationStatus: (typeof STATUS)[keyof typeof STATUS],
  ) => {
    const cleanComment = comment.trim();

    // ✅ Rejet / Demande de modifs => commentaire obligatoire
    if (validationStatus !== STATUS.approved && !cleanComment) {
      toast({
        title: t("missionsToSubmit.validation.warning"),
        description:
          validationStatus === STATUS.rejected
            ? t("missionsToSubmit.validation.comment_required_reject")
            : t("missionsToSubmit.validation.comment_required_modify"),
        variant: "destructive",
      });
      return;
    }

    // ✅ Cahier des charges: Approver seulement si Brief + Questionnaire sont conformes
    if (validationStatus === STATUS.approved) {
      if (briefStatus !== "ok" || questionnaireStatus !== "ok") {
        toast({
          title: t("missionsToSubmit.validation.warning"),
          description: t(
            "missionsToSubmit.validation.must_validate_steps_before_approve",
          ),
          variant: "destructive",
        });
        return;
      }
    }

    validateMission.execute({
      missionId: mission.id,
      validationStatus,
      comment: cleanComment || undefined,
    });
  };

  const renderSection = (
    title: string,
    content: string,
    criteria: string[],
    step: 1 | 2,
  ) => (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Étape {step} : {title}
      </h2>

      <div className="p-4 bg-gray-50 border border-gray-100 rounded-md mb-4 whitespace-pre-wrap font-mono text-sm">
        {content}
      </div>

      <h3 className="text-lg font-medium mb-2 text-gray-700">
        Critères d'analyse :
      </h3>
      <ul className="list-disc ml-6 space-y-1 text-sm text-gray-600">
        {criteria.map((c, index) => (
          <li key={index}>{c}</li>
        ))}
      </ul>

      <div className="mt-4 flex space-x-2 justify-end">
        <Button
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={() =>
            step === 1
              ? setBriefStatus("issue")
              : setQuestionnaireStatus("issue")
          }
        >
          <X className="w-4 h-4 mr-2" />
          Problème détecté
        </Button>
        <Button
          variant="outline"
          className="text-green-600 border-green-200 hover:bg-green-50"
          onClick={() =>
            step === 1 ? setBriefStatus("ok") : setQuestionnaireStatus("ok")
          }
        >
          <Check className="w-4 h-4 mr-2" />
          Conforme
        </Button>
      </div>
    </div>
  );

  const approveDisabled =
    validateMission.isExecuting ||
    mission.validationStatus === STATUS.approved ||
    briefStatus !== "ok" ||
    questionnaireStatus !== "ok";

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        {renderSection(
          t("missionsToSubmit.validation.step1_title"),
          [
            `Problématique: ${mission.problemSummary || t("common.no_data")}`,
            `Objectifs: ${mission.objectives || t("common.no_data")}`,
            `Audiences: ${mission.audiences ? prettyJson(mission.audiences) : t("common.no_data")}`,
            `Nb. Réponses: ${mission.targetSampleSize ?? t("common.not_specified")}`,
          ].join("\n"),
          [
            t("missionsToSubmit.validation.c1_objectives"),
            t("missionsToSubmit.validation.c1_problem"),
            t("missionsToSubmit.validation.c1_segments"),
            t("missionsToSubmit.validation.c1_coherence"),
          ],
          1,
        )}

        {renderSection(
          t("missionsToSubmit.validation.step2_title"),
          questionnaireText,
          [
            t("missionsToSubmit.validation.c2_brief_coherence"),
            t("missionsToSubmit.validation.c2_structure"),
            t("missionsToSubmit.validation.c2_clarity"),
            t("missionsToSubmit.validation.c2_workload"),
            t("missionsToSubmit.validation.c2_feasibility"),
          ],
          2,
        )}
      </div>

      <div className="col-span-1 sticky top-8 h-fit space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Actions SuperAdmin</h3>

          <div className="space-y-4">
            <Textarea
              placeholder={t("missionsToSubmit.validation.comment_placeholder")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />

            <Button
              className="w-full justify-start bg-green-500 hover:bg-green-600"
              onClick={() => handleValidationAction(STATUS.approved)}
              disabled={approveDisabled}
              title={
                approveDisabled &&
                (briefStatus !== "ok" || questionnaireStatus !== "ok")
                  ? t(
                      "missionsToSubmit.validation.must_validate_steps_before_approve",
                    )
                  : undefined
              }
            >
              {validateMission.isExecuting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {t("missionsToSubmit.validation.action_approve")}
            </Button>

            <Button
              className="w-full justify-start bg-yellow-500 hover:bg-yellow-600"
              onClick={() =>
                handleValidationAction(STATUS.modification_requested)
              }
              disabled={
                validateMission.isExecuting ||
                mission.validationStatus === "modification_requested"
              }
            >
              <Edit className="w-4 h-4 mr-2" />
              {t("missionsToSubmit.validation.action_modify")}
            </Button>

            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => handleValidationAction(STATUS.rejected)}
              disabled={
                validateMission.isExecuting ||
                mission.validationStatus === STATUS.rejected
              }
            >
              <X className="w-4 h-4 mr-2" />
              {t("missionsToSubmit.validation.action_reject")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
