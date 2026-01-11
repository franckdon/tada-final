"use client";

import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/locales/client";
import { SubDashboardItem } from "@prisma/client";
import { QuestionData, SurveyData } from "@/lib/utils";
import { BarChartHorizontalCard } from "../../boards/graphs/bar-chart-horizontal";
import { PieChartCard } from "../../boards/graphs/pie-chart";
import { BarChartHorizontalStackedCard } from "../../boards/graphs/bar-chart-horizontal-stacked";
import { ArrayChartCard } from "../../boards/graphs/array-chart";
import { useAction } from "next-safe-action/hooks";
import { deleteSubDashboardItemAction } from "@/actions/missions/sub-dashboard/delete-subdashboard-item-action";
import { useBoolean } from "@/hooks/use-boolean";
import { DeleteConfirmation } from "@tada/ui/components/customs/delete-confirmation-modal";

type QuestionnaireEditor = SubDashboardItem & {
  isShared: boolean;
};

type ChartData = {
  label: string;
  value: number;
};

export function SurveyEditor({
  id,
  imageUrl,
  subDashboardId,
  surveyKey,
  content,
  isShared,
}: QuestionnaireEditor) {
  const t = useI18n();
  const { toast } = useToast();
  const deleteSurveyModal = useBoolean();

  const parsedContent = JSON.parse(content || "{}") as QuestionData;

  const deleteSubDashboardItem = useAction(deleteSubDashboardItemAction, {
    onSuccess: () => {
      toast({
        title: t("missions.addSubDashboard.delete.success"),
      });
      deleteSurveyModal.onFalse();
    },
    onError: (error) => {
      console.log("error", error);
      toast({
        title: t("missions.addSubDashboard.delete.error"),
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteSubDashboardItem.execute({
      id,
    });
  };

  return (
    <div>
      {parsedContent.chart_type === "BarChartHorizontalCard" && (
        <>
          <BarChartHorizontalCard
            primaryDataKey="value"
            categoryKey="label"
            data={parsedContent.data as ChartData[]}
            config={parsedContent.config}
            title={parsedContent.question}
            description=""
            participationQuestions=""
            onDelete={deleteSurveyModal.onTrue}
            isDeletable
          />
        </>
      )}
      {parsedContent.chart_type === "PieChart" && (
        <>
          <PieChartCard
            categoryKey="label"
            primaryDataKey="value"
            data={parsedContent.data as ChartData[]}
            config={parsedContent.config}
            title={parsedContent.question}
            participantCount={parsedContent.participants_responded}
            description=""
            participationQuestions=""
            onDelete={deleteSurveyModal.onTrue}
            isDeletable
          />
        </>
      )}
      {parsedContent.chart_type === "BarChartHorizontalStackedCard" && (
        <>
          <BarChartHorizontalStackedCard
            categoryKey="label"
            data={parsedContent.data as ChartData[]}
            config={parsedContent.config}
            title={parsedContent.question}
            participantCount={parsedContent.participants_responded}
            primaryKeys={parsedContent.primaryKeys}
            min={parsedContent.min || 0}
            max={parsedContent.max || 100}
            description=""
            participationQuestions=""
            onDelete={deleteSurveyModal.onTrue}
            isDeletable
          />
        </>
      )}
      {parsedContent.chart_type === "ArrayChartCard" && (
        <>
          <ArrayChartCard
            texts={parsedContent.data as string[]}
            title={parsedContent.question}
            description=""
            participationQuestions=""
            onDelete={deleteSurveyModal.onTrue}
            isDeletable
          />
        </>
      )}

      <DeleteConfirmation
        isOpen={deleteSurveyModal.value}
        onToggle={deleteSurveyModal.onToggle}
        title={t("missions.addSubDashboard.surveyItem.deleteTitle")}
        message={t("missions.addSubDashboard.surveyItem.deleteMessage")}
        confirmLabel={t("missions.addSubDashboard.surveyItem.deleteConfirm")}
        cancelLabel={t("missions.addSubDashboard.surveyItem.deleteCancel")}
        deletingText={t("missions.addSubDashboard.surveyItem.deleting")}
        onConfirm={handleDelete}
        isDeletingInfo={deleteSubDashboardItem.status === "executing"}
      />
    </div>
  );
}
