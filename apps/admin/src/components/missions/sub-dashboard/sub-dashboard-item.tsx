"use client";

import { useEffect, useState } from "react";
import { Plus, X, Type, ImageIcon, FileQuestion } from "lucide-react";
import { useI18n } from "@/locales/client";
import { useAction } from "next-safe-action/hooks";
import { createSubDashboardItemAction } from "@/actions/missions/sub-dashboard/create-subdashboard-item-action";
import { toast } from "@/hooks/use-toast";
import { useBoolean } from "@/hooks/use-boolean";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { QuestionData, SurveyData } from "@/lib/utils";
import { BarChartHorizontalCard } from "../boards/graphs/bar-chart-horizontal";
import { PieChartCard } from "../boards/graphs/pie-chart";
import { BarChartHorizontalStackedCard } from "../boards/graphs/bar-chart-horizontal-stacked";
import { ArrayChartCard } from "../boards/graphs/array-chart";
import { Button } from "@tada/ui/components/button";
import { Icons } from "@/components/icons";

type ItemType = "text" | "image" | "survey";

interface AddDashboardItemProps {
  subDashboardId: string;
  questionsData: QuestionData[];
  responseDb: SurveyData;
}

export function AddDashboardItem({
  subDashboardId,
  questionsData,
  responseDb,
}: AddDashboardItemProps) {
  const t = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const surveyModal = useBoolean();
  const [availableQuestions, setAvailableQuestions] =
    useState<QuestionData[]>(questionsData);

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest(".add-dashboard-item")) {
      setIsOpen(false);
    }
  };

  const createSubDashboardItem = useAction(createSubDashboardItemAction, {
    onSuccess: () => {
      toast({
        title: t("missions.addSubDashboard.create.success"),
      });
      document.addEventListener("mousedown", handleClickOutside);

      surveyModal.onFalse();
    },
    onError: (error) => {
      console.log("error", error);
      toast({
        title: t("missions.addSubDashboard.create.error"),
        variant: "destructive",
      });
    },
  });

  const handleAddItem = (itemType: ItemType) => {
    if (itemType === "survey") {
      surveyModal.onTrue();
      return;
    }

    createSubDashboardItem.execute({
      subDashboardId,
      type: itemType,
    });
  };

  const handleSurveyItem = (data: QuestionData) => {
    createSubDashboardItem.execute({
      subDashboardId,
      type: "survey",
      content: JSON.stringify(data),
    });
  };

  const actions = [
    {
      icon: <Type className="w-6 h-6 text-indigo-500" />,
      title: t("missions.addSubDashboard.item.text.title") || "Texte",
      description:
        t("missions.addSubDashboard.item.text.description") ||
        "Ajouter du contenu textuel",
      onClick: () => handleAddItem("text"),
    },
    {
      icon: <ImageIcon className="w-6 h-6 text-indigo-500" />,
      title: t("missions.addSubDashboard.item.image.title") || "Image",
      description:
        t("missions.addSubDashboard.item.image.description") ||
        "Ajouter une image",
      onClick: () => handleAddItem("image"),
    },
    {
      icon: <FileQuestion className="w-6 h-6 text-indigo-500" />,
      title: t("missions.addSubDashboard.item.survey.title") || "Questionnaire",
      description:
        t("missions.addSubDashboard.item.survey.description") ||
        "Intégrer un questionnaire",
      onClick: () => handleAddItem("survey"),
    },
  ];

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isPending = createSubDashboardItem.status === "executing";

  return (
    <div className="relative inline-block add-dashboard-item">
      <div
        className={`absolute -left-1/2 -translate-x-1/2 bottom-full mb-2 w-[430px] shadow-lg z-50 transition-all duration-200 
      ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        <div className="bg-white text-gray-800 p-4 border">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            {t("missions.addSubDashboard.item.title") || "Ajouter un élément"}
          </h3>
          <div className="space-y-2">
            {actions.map((action) => (
              <button
                key={action.title}
                type="button"
                onClick={action.onClick}
                disabled={isPending}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left disabled:opacity-50"
              >
                {action.icon}
                <div>
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs text-gray-500">
                    {action.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-100 transition-all duration-200 disabled:opacity-50 ${
          isOpen ? "rotate-45" : ""
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Plus className="w-6 h-6 text-gray-500 hover:text-blue-500" />
        )}
      </button>

      <Dialog open={surveyModal.value} onOpenChange={surveyModal.onToggle}>
        <DialogContent className="w-[80vw] h-[90vh] max-w-none max-h-none p-6">
          <DialogHeader>
            <DialogTitle>
              Choisissez le graphe que vous voulez et ajouter le
            </DialogTitle>
            <DialogDescription className="max-h-[75vh] overflow-y-auto">
              {availableQuestions
                .filter((question) => question.chart_type !== "not implemented")
                .map((question: QuestionData, index) => (
                  <div key={index} className="relative">
                    <div className="flex py-3 justify-end">
                      <Button
                        onClick={() => handleSurveyItem(question)}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Icons.spinner className="w-4 h-4 animate-spin" />
                        ) : (
                          t("common.add")
                        )}
                      </Button>
                    </div>

                    {question.chart_type === "BarChartHorizontalCard" && (
                      <BarChartHorizontalCard
                        data={
                          question.data as Array<{
                            label: string;
                            value: number;
                          }>
                        }
                        config={question.config}
                        primaryDataKey="value"
                        categoryKey="label"
                        title={question.question}
                        description=""
                        participationQuestions={`${index + 1} de ${
                          questionsData.length
                        } | ${
                          question.participants_responded
                        } Participants (${Math.round(
                          (question.participants_responded /
                            responseDb.metadata.total_responses) *
                            100
                        )}%)`}
                      />
                    )}
                    {question.chart_type === "PieChart" && (
                      <PieChartCard
                        data={
                          question.data as Array<{
                            label: string;
                            value: number;
                          }>
                        }
                        config={question.config}
                        primaryDataKey="value"
                        categoryKey="label"
                        title={question.question}
                        description=""
                        participationQuestions={`${index + 1} de ${
                          questionsData.length
                        } | ${
                          question.participants_responded
                        } Participants (${Math.round(
                          (question.participants_responded /
                            responseDb.metadata.total_responses) *
                            100
                        )}%)`}
                        participantCount={question.participants_responded}
                      />
                    )}
                    {question.chart_type ===
                      "BarChartHorizontalStackedCard" && (
                      <BarChartHorizontalStackedCard
                        data={
                          question.data as unknown as Array<{
                            label: string;
                            value: number;
                          }>
                        }
                        config={question.config}
                        categoryKey="label"
                        title={question.question}
                        description=""
                        participationQuestions={`${index + 1} de ${
                          questionsData.length
                        } | ${
                          question.participants_responded
                        } Participants (${Math.round(
                          (question.participants_responded /
                            responseDb.metadata.total_responses) *
                            100
                        )}%)`}
                        participantCount={question.participants_responded}
                        primaryKeys={question.primaryKeys}
                        min={question.min || 0}
                        max={question.max || 100}
                      />
                    )}
                    {question.chart_type === "ArrayChartCard" && (
                      <ArrayChartCard
                        texts={question.data as string[]}
                        title={question.question}
                        description=""
                        participationQuestions={`${index + 1} de ${
                          questionsData.length
                        } | ${
                          question.participants_responded
                        } Participants (${Math.round(
                          (question.participants_responded /
                            responseDb.metadata.total_responses) *
                            100
                        )}%)`}
                      />
                    )}
                  </div>
                ))}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
