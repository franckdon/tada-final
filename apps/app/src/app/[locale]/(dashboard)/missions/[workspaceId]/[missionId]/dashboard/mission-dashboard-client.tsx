// src/app/[locale]/(dasboard)/missions/[workspaceId]/[missionId]/dasboard/mission-dashboard-client.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryState } from "nuqs";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@tada/ui/components/button";

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
  initialQuestions: QuestionData[];
  totalResponses: number;
  missionStatus: string;
  commentCountsByQuestion?: Record<string, number>;
  currentUserId: string;
  workspaceMembers: WorkspaceMember[];
}

export default function MissionDashboardClient({
  missionId,
  initialQuestions,
  totalResponses,
  missionStatus,
  commentCountsByQuestion,
  currentUserId,
  workspaceMembers,
}: MissionDashboardClientProps) {
  // On enrichit QuestionData avec l’état de vue (filter + sorted)
  const [questions, setQuestions] = useState<QuestionWithView[]>(() =>
    initialQuestions.map((q) => ({
      ...q,
      activeFilter: "standard",
      isSorted: false,
    }))
  );

  const [activeBubbleQuestionKey, setActiveBubbleQuestionKey] = useState<
    string | null
  >(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [showRail, setShowRail] = useState(false);

  const openCommentsForQuestion = (question: QuestionWithView) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("commentQuestionKey", question.question);

    router.replace(`?${params.toString()}`, { scroll: false });

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("scroll-to-question", {
          detail: { questionKey: question.question },
        })
      );
    }

    setActiveBubbleQuestionKey((prev) =>
      prev === question.question ? null : question.question
    );
  };

  const [, setQuestionId] = useQueryState("questionId", {
    defaultValue: "",
  });

  const openChangeChartModal = (question: QuestionWithView) => {
    const id = question.chartId ?? question.question;
    setQuestionId(id);
  };

  const getQuestionConfig = useCallback(
    (questionId: string) => {
      const q = questions.find(
        (q) => q.chartId === questionId || q.question === questionId
      );
      if (!q) return undefined;

      return {
        allowed_chart: q.allowed_chart,
        currentChartType: q.chart_type,
        currentFilter: q.activeFilter,
        currentSorted: q.isSorted,
      };
    },
    [questions]
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
            ? {
                ...q,
                chart_type: chartType,
                activeFilter: filter,
                isSorted,
              }
            : q
        )
      );
    },
    []
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

  const exportAllCsv = (delimiter: ";" | ",") => {
    const allRows = questions.flatMap((q) => questionToCsvRows(q as any));
    downloadCsv(`mission-${missionId}-all-questions.csv`, allRows, {
      delimiter,
    });
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ questionKey: string }>;
      const key = custom.detail?.questionKey;
      if (!key) return;

      const el =
        document.querySelector<HTMLElement>(`[data-question-key="${key}"]`) ||
        document.getElementById(`question-${key}`);

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-sky-400", "ring-offset-2");

        setTimeout(() => {
          el.classList.remove("ring-2", "ring-sky-400", "ring-offset-2");
        }, 2000);
      }
    };

    window.addEventListener("scroll-to-question", handler);
    return () => window.removeEventListener("scroll-to-question", handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const y =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      // Debug temporaire
      // console.log("[Dashboard] scrollY =", y);

      setShowRail(y > 200);
    };

    // Évalue une première fois au mount
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const scroller = document.getElementById("dashboard-scroll");
    if (!scroller) {
      console.warn("[MissionDashboard] #dashboard-scroll introuvable");
      return;
    }

    const handleScroll = () => {
      const y = scroller.scrollTop;
      setShowRail(y > 200);
    };

    // init
    handleScroll();

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {questions
        .filter((question) => question.participants_responded > 0)
        .map((question, index) => {
          const commentCount =
            commentCountsByQuestion?.[question.question] ?? 0;

          const participationLabel = `${index + 1} de ${
            questions.length
          } | ${question.participants_responded} Participants (${Math.round(
            (question.participants_responded / totalResponses) * 100
          )}%)`;

          const renderInsights =
            !!question.insights && !!question.insightsUpdatedAt;

          const type = question.chart_type;
          const questionKey = question.question;
          const domId = `question-${index + 1}`;
          const bubbleOpen = activeBubbleQuestionKey === questionKey;

          // Valeurs par défaut : pour les viz non bar/column
          let chartData: Array<{ label: string; value: number }> | any =
            question.data;
          let chartConfig: ChartConfig = question.config as ChartConfig;

          // Pour bar / column → on délègue au helper applyFilterAndSort
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
              data-export-id={question.chartId ?? `q-${index + 1}`}
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

              {/* {question.type !== "text" && question.type !== "comment" && (
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openChangeChartModal(question)}
                  >
                    Modifier la visualisation
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openCommentsForQuestion(question)}
                    className="relative"
                    title={question.question}
                  >
                    Commentaires
                    {commentCount > 0 && (
                      <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] px-1">
                        {commentCount}
                      </span>
                    )}
                  </Button>
                </div>
              )} */}

              {/* BAR / COLUMN */}
              {type === "bar" && (
                <BarChartHorizontalCard
                  subDashboardItemId={question.chartId ?? ""}
                  data={
                    chartData as Array<{
                      label: string;
                      value: number;
                      percentage?: number;
                    }>
                  }
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
                  data={
                    chartData as Array<{
                      label: string;
                      value: number;
                      percentage?: number;
                    }>
                  }
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

              {/* STACKED BAR (horizontal) */}
              {type === "stacked_bar" && (
                <BarChartHorizontalStackedCard
                  subDashboardItemId={question.chartId ?? ""}
                  data={question.data as any}
                  config={question.config as ChartConfig}
                  categoryKey={
                    question.type === "rating" ? "category" : "label"
                  }
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

              {/* STACKED COLUMN (vertical) */}
              {type === "stacked_column" && (
                <BarChartStackedCard
                  subDashboardItemId={question.chartId ?? ""}
                  data={question.data as any}
                  config={question.config as ChartConfig}
                  categoryKey={
                    question.type === "rating" ? "category" : "label"
                  }
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

              {/* PIE */}
              {type === "pie" && (
                <PieChartCard
                  subDashboardItemId={question.chartId ?? ""}
                  data={
                    (question.data as Array<{
                      label: string;
                      value: number;
                    }>) ?? []
                  }
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

              {/* TABLE */}
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

              {/* TURF / radar */}
              {type === "turf" && (
                <RadarChartCard
                  subDashboardItemId={question.chartId ?? ""}
                  data={
                    question.data as Array<{ label: string; value: number }>
                  }
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
        //visible={true}
      />

      {/* Modal d’export */}
      <ExportOptionsDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        missionId={missionId}
        questions={questions}
        totalResponses={totalResponses}
      />
    </>
  );
}
