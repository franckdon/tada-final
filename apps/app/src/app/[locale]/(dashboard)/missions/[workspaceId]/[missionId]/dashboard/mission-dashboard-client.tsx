"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryState } from "nuqs";
import { useRouter, useSearchParams } from "next/navigation";

import { BarChartCard } from "@/components/missions/boards/graphs/bar-chart";
import { BarChartHorizontalCard } from "@/components/missions/boards/graphs/bar-chart-horizontal";
import { BarChartHorizontalStackedCard } from "@/components/missions/boards/graphs/bar-chart-horizontal-stacked";
import { BarChartStackedCard } from "@/components/missions/boards/graphs/bar-chart-stacked";
import { PieChartCard } from "@/components/missions/boards/graphs/pie-chart";
import { RadarChartCard } from "@/components/missions/boards/graphs/radar-chart";
import { ArrayChartCard } from "@/components/missions/boards/graphs/array-chart";

import { ChartConfig } from "@/components/missions/boards/graphs/ui/chart";
import { applyFilterAndSort, QuestionWithView } from "@/lib/chart-filtering";

import { InsightsSection } from "@/components/missions/boards/insights-section";
import FilterChangeChartType from "@/components/missions/boards/modals/filter-change-chart-type";

import type { QuestionData } from "@/lib/utils";
import type { VisualizationId } from "@/lib/chart-types";
import type { WorkspaceMember } from "@/components/comments/comments-types";
import { QuestionCommentsBubble } from "@/components/missions/comments/question-comments-bubble";
import { CommentPin } from "@/components/missions/comments/comment-pin";
import { DashboardActionsRail } from "@/components/missions/boards/dashboard-actions-rail";
import { ExportOptionsDialog } from "@/components/missions/boards/modals/export-options-dialog";
import { questionToCsvRows } from "@/lib/question-to-csv";
import { downloadCsv } from "@/lib/export-csv";

interface MissionDashboardClientProps {
  missionId: string;
  missionName: string;
  initialQuestions: QuestionData[];
  totalResponses: number;
  missionStatus: string;
  commentCountsByQuestion?: Record<string, number>;
  currentUserId: string;
  workspaceMembers: WorkspaceMember[];
}

export default function MissionDashboardClient({
  missionId,
  missionName,
  initialQuestions,
  totalResponses,
  missionStatus,
  commentCountsByQuestion,
  currentUserId,
  workspaceMembers,
}: MissionDashboardClientProps) {
  const [questions, setQuestions] = useState<QuestionWithView[]>(() =>
    (initialQuestions ?? []).map((q) => ({
      ...q,
      activeFilter: "standard",
      isSorted: false,
    })),
  );

  const [activeBubbleQuestionKey, setActiveBubbleQuestionKey] = useState<
    string | null
  >(null);

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [showRail, setShowRail] = useState(false);

  const topSentinelRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("[MissionDashboardClient]", {
      initialQuestionsCount: initialQuestions?.length,
      questionsCount: questions.length,
      totalResponses,
      missionId,
      missionName,
      missionStatus,
    });
  }, [
    initialQuestions?.length,
    questions.length,
    totalResponses,
    missionId,
    missionName,
    missionStatus,
  ]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowRail(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "-120px 0px 0px 0px",
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  const openCommentsForQuestion = (question: QuestionWithView) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("commentQuestionKey", question.question);
    router.replace(`?${params.toString()}`, { scroll: false });

    window.dispatchEvent(
      new CustomEvent("scroll-to-question", {
        detail: { questionKey: question.question },
      }),
    );

    setActiveBubbleQuestionKey((prev) =>
      prev === question.question ? null : question.question,
    );
  };

  const [, setQuestionId] = useQueryState("questionId", { defaultValue: "" });

  const getQuestionConfig = useCallback(
    (questionId: string) => {
      const q = questions.find(
        (q) => q.chartId === questionId || q.question === questionId,
      );
      if (!q) return undefined;

      return {
        allowed_chart: q.allowed_chart,
        currentChartType: q.chart_type,
        currentFilter: q.activeFilter,
        currentSorted: q.isSorted,
      };
    },
    [questions],
  );

  const handleApply = useCallback(
    ({
      questionId,
      chartType,
      filter,
      isSorted,
    }: {
      questionId: string;
      filter: "standard" | "age" | "gender" | "genre";
      chartType: VisualizationId;
      isSorted: boolean;
    }) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.chartId === questionId || q.question === questionId
            ? { ...q, chart_type: chartType, activeFilter: filter, isSorted }
            : q,
        ),
      );
    },
    [],
  );

  const exportQuestionCsv = (q: QuestionWithView) => {
    const rows = questionToCsvRows(q as any);
    const safeName = (q.question || "question")
      .slice(0, 80)
      .replace(/[^\w\- ]+/g, "")
      .trim()
      .replace(/\s+/g, "_");

    downloadCsv(`mission-${missionId}-${safeName}.csv`, rows);
  };

  if (!questions.length) {
    return (
      <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="text-lg font-semibold">Aucun graphique à afficher</h2>
        <p className="mt-2 text-sm text-gray-500">
          Causes possibles :
          <br />• la mission n’a pas de réponses
          <br />• l’extraction des questions retourne un tableau vide
          <br />• tu ne passes pas <code>initialQuestions</code> au composant
        </p>

        <div className="mt-4 text-xs text-gray-500">
          Debug: totalResponses = {totalResponses} | missionId = {missionId}
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={topSentinelRef} className="h-px w-full" />

      {questions.map((question, index) => {
        const commentCount = commentCountsByQuestion?.[question.question] ?? 0;

        const pct =
          totalResponses > 0
            ? Math.round(
                (question.participants_responded / totalResponses) * 100,
              )
            : 0;

        const participationLabel = `${index + 1} de ${questions.length} | ${
          question.participants_responded
        } Participants (${pct}%)`;

        const renderInsights =
          !!question.insights && !!question.insightsUpdatedAt;

        const type = question.chart_type;
        const questionKey = question.question;
        const domId = `question-${index + 1}`;
        const bubbleOpen = activeBubbleQuestionKey === questionKey;

        let chartData: Array<{ label: string; value: number }> | any =
          question.data;
        let chartConfig: ChartConfig = question.config as ChartConfig;

        if (type === "bar" || type === "column") {
          const result = applyFilterAndSort(question, type);
          chartData = result.data;
          chartConfig = result.config;
        }

        return (
          <div
            key={question.chartId ?? index}
            id={domId}
            data-question-key={questionKey}
            data-export-question="true"
            data-export-id={question.chartId ?? questionKey ?? domId}
            data-export-title={question.question}
            className="relative mb-8 space-y-3"
          >
            {commentCount > 0 && (
              <CommentPin
                count={commentCount}
                label={question.question}
                onClick={() => openCommentsForQuestion(question)}
              />
            )}

            {renderInsights && (
              <InsightsSection
                insights={question.insights as any}
                insightsUpdatedAt={question.insightsUpdatedAt}
                questionTitle={question.question}
                missionStatus={missionStatus}
              />
            )}

            {type === "bar" && (
              <BarChartHorizontalCard
                subDashboardItemId={question.chartId ?? ""}
                data={chartData}
                config={chartConfig}
                primaryDataKey="value"
                categoryKey="label"
                title={question.question}
                description=""
                participationQuestions={participationLabel}
                handleExportCsv={() => exportQuestionCsv(question)}
                onCommentsClick={() => openCommentsForQuestion(question)}
                commentCount={commentCount}
              />
            )}

            {type === "column" && (
              <BarChartCard
                subDashboardItemId={question.chartId ?? ""}
                data={chartData}
                config={chartConfig}
                primaryDataKey="value"
                categoryKey="label"
                title={question.question}
                description=""
                participationQuestions={participationLabel}
                handleExportCsv={() => exportQuestionCsv(question)}
                onCommentsClick={() => openCommentsForQuestion(question)}
                commentCount={commentCount}
              />
            )}

            {type === "stacked_bar" && (
              <BarChartHorizontalStackedCard
                subDashboardItemId={question.chartId ?? ""}
                data={question.data as any}
                config={question.config as ChartConfig}
                categoryKey={question.type === "rating" ? "category" : "label"}
                title={question.question}
                description=""
                participationQuestions={participationLabel}
                participantCount={question.participants_responded}
                primaryKeys={question.primaryKeys}
                min={question.min || 0}
                max={question.max || 100}
                handleExportCsv={() => exportQuestionCsv(question)}
                onCommentsClick={() => openCommentsForQuestion(question)}
                commentCount={commentCount}
              />
            )}

            {type === "stacked_column" && (
              <BarChartStackedCard
                subDashboardItemId={question.chartId ?? ""}
                data={question.data as any}
                config={question.config as ChartConfig}
                categoryKey={question.type === "rating" ? "category" : "label"}
                title={question.question}
                description=""
                participationQuestions={participationLabel}
                participantCount={question.participants_responded}
                primaryKeys={question.primaryKeys}
                min={question.min || 0}
                max={question.max || 100}
                handleExportCsv={() => exportQuestionCsv(question)}
                onCommentsClick={() => openCommentsForQuestion(question)}
                commentCount={commentCount}
              />
            )}

            {type === "pie" && (
              <PieChartCard
                subDashboardItemId={question.chartId ?? ""}
                data={(question.data as any) ?? []}
                config={question.config as ChartConfig}
                primaryDataKey="value"
                categoryKey="label"
                title={question.question}
                description=""
                participationQuestions={participationLabel}
                participantCount={question.participants_responded}
                handleExportCsv={() => exportQuestionCsv(question)}
                onCommentsClick={() => openCommentsForQuestion(question)}
                commentCount={commentCount}
              />
            )}

            {type === "table" && (
              <ArrayChartCard
                subDashboardItemId={question.chartId ?? ""}
                texts={question.data as unknown[]}
                title={question.question}
                description=""
                participationQuestions={participationLabel}
                handleExportCsv={() => exportQuestionCsv(question)}
                onCommentsClick={() => openCommentsForQuestion(question)}
                commentCount={commentCount}
              />
            )}

            {type === "turf" && (
              <RadarChartCard
                subDashboardItemId={question.chartId ?? ""}
                data={question.data as any}
                config={question.config as ChartConfig}
                primaryDataKey="value"
                categoryKey="label"
                title={question.question}
                description=""
                participationQuestions={participationLabel}
                handleExportCsv={() => exportQuestionCsv(question)}
                onCommentsClick={() => openCommentsForQuestion(question)}
                commentCount={commentCount}
              />
            )}

            {bubbleOpen && (
              <QuestionCommentsBubble
                missionId={missionId}
                questionKey={questionKey}
                questionLabel={question.question}
                currentUserId={currentUserId}
                workspaceMembers={workspaceMembers}
                onClose={() => setActiveBubbleQuestionKey(null)}
              />
            )}
          </div>
        );
      })}

      <FilterChangeChartType
        getQuestionConfig={getQuestionConfig}
        onApply={handleApply}
      />

      <DashboardActionsRail
        onExportClick={() => setIsExportDialogOpen(true)}
        visible={showRail}
      />

      <ExportOptionsDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        missionId={missionId}
        missionName={missionName}
        questions={questions}
        totalResponses={totalResponses}
      />
    </>
  );
}
