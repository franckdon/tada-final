"use client";

import {
  type Survey,
  useSurveysBuilder,
} from "@/context/surveys-builder-context";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { Edit, Loader2, Plus, RefreshCw, Trash } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { AddNewQuestionModal } from "@/components/ui/add-new-question-modal";
import { Template } from "./type";
import { updateTemplateAction } from "@/actions/templates/update-template-action";
import { deleteTemplateAction } from "@/actions/templates/delete-template-action";
import { useRouter } from "next/navigation";
import { addQuestionTemplateAIAction } from "@/actions/templates/add-question-template-ai.action";

interface HeaderTemplateProps {
  template: Pick<
    Template,
    "id" | "name" | "type" | "internal" | "organizationId"
  >;
}

export function HeaderTemplate({ template }: HeaderTemplateProps) {
  const t = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const { setSurveys } = useSurveysBuilder();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(template.name);

  const addQuestionAI = useAction(addQuestionTemplateAIAction, {
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

  const updateTemplate = useAction(updateTemplateAction, {
    onSuccess: () => {
      setEditingTitle(false);
      toast({
        title: t("missions.templates.updateTemplateSuccess"),
        description: t("missions.templates.updateTemplateSuccessDescription"),
      });
    },
    onError: () => {
      toast({
        title: t("missions.templates.updateTemplateError"),
        description: t("missions.templates.updateTemplateErrorDescription"),
        variant: "destructive",
      });
    },
  });

  const deleteTemplate = useAction(deleteTemplateAction, {
    onSuccess: () => {
      toast({
        title: t("missions.templates.deleteTemplateSuccess"),
        description: t("missions.templates.deleteTemplateSuccessDescription"),
      });
      router.push(`/missions/${template.organizationId}/templates`);
    },
    onError: () => {
      toast({
        title: t("missions.templates.deleteTemplateError"),
        description: t("missions.templates.deleteTemplateErrorDescription"),
        variant: "destructive",
      });
    },
  });

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
      <div className="flex justify-between items-center">
        {editingTitle ? (
          <div className="mb-2">
            <textarea
              className="w-full text-black dark:text-white p-2 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              rows={4}
              value={tempTitle}
              onChange={(e) => {
                setTempTitle(e.target.value);
              }}
            />

            <div className="flex mt-2 space-x-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setEditingTitle(false)}
                className="text-black dark:text-white"
              >
                {t("common.cancel")}
              </Button>
              <Button
                size="sm"
                type="button"
                onClick={() => {
                  updateTemplate.execute({
                    templateId: template.id,
                    name: tempTitle,
                  });
                }}
                disabled={updateTemplate.status === "executing"}
              >
                {updateTemplate.status === "executing" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t("common.save")
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className=" flex space-x-8 items-center">
            <h1 className="text-lg font-medium text-gray-800 dark:text-white">
              {tempTitle}
            </h1>
            {template.internal && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setEditingTitle(true)}
                >
                  <Edit className="w-4 h-4 " />
                </Button>
              </div>
            )}
          </div>
        )}
        {template.internal && (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              type="button"
              className="flex items-center justify-center gap-2"
              onClick={() => {
                deleteTemplate.execute({
                  templateId: template.id,
                  organizationId: template.organizationId as string,
                });
              }}
              disabled={deleteTemplate.status === "executing"}
            >
              {deleteTemplate.status === "executing" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash size={14} />
                  {t("missions.templates.deleteTemplate")}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      {template.internal && (
        <div className="flex mt-3 gap-2">
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            {t("missions.surveys.addNewQuestion.add")}
          </Button>
        </div>
      )}

      <AddNewQuestionModal
        isOpen={showAddModal}
        onOpenChange={setShowAddModal}
        updateSurveyQuestions={(surveys) => {
          updateTemplate.execute({
            templateId: template.id,
            questions: surveys,
          });
        }}
        isLoadingUpdate={updateTemplate.status === "executing"}
        addQuestionAI={async (userPrompt) => {
          await addQuestionAI.executeAsync({
            templateId: template.id,
            userPrompt,
          });
        }}
        isLoadingAddQuestionAI={addQuestionAI.status === "executing"}
      />
    </header>
  );
}
