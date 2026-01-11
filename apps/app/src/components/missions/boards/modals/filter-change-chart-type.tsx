"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@tada/ui/components/button";
import { Label } from "@tada/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { Switch } from "@tada/ui/components/switch";
import { useQueryState } from "nuqs";
import { ALL_VISUALIZATIONS, type VisualizationId } from "@/lib/chart-types";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@tada/ui/components/sheet";
import { useI18n } from "@/locales/client";

type FilterId = "standard" | "age" | "gender" | "genre";

interface FilterChangeChartTypeProps {
  getQuestionConfig?: (questionId: string) =>
    | {
        allowed_chart: VisualizationId[];
        currentChartType: VisualizationId;
        currentFilter?: FilterId;
        currentSorted?: boolean;
      }
    | undefined;

  onApply?: (params: {
    questionId: string;
    filter: FilterId;
    chartType: VisualizationId;
    isSorted: boolean;
  }) => void;
}

export default function FilterChangeChartType({
  getQuestionConfig,
  onApply,
}: FilterChangeChartTypeProps) {
  const t = useI18n();
  const [questionId, setQuestionId] = useQueryState("questionId", {
    defaultValue: "",
  });

  const [filter, setFilter] = useState<FilterId>("standard");
  const [chartType, setChartType] = useState<VisualizationId>("bar");
  const [isSorted, setIsSorted] = useState(false);

  const isOpen = Boolean(questionId);

  const config = useMemo(() => {
    if (!questionId || !getQuestionConfig) return undefined;
    return getQuestionConfig(questionId);
  }, [questionId, getQuestionConfig]);

  const availableVisualizations = useMemo(() => {
    if (!config?.allowed_chart?.length) return ALL_VISUALIZATIONS;
    return ALL_VISUALIZATIONS.filter((viz) =>
      config.allowed_chart.includes(viz.id)
    );
  }, [config]);

  /**
   * ✅ Hydrate local state uniquement quand on change de questionId
   * (et pas à chaque update de config venant du parent)
   */
  const hydratedForQuestionRef = useRef<string>("");

  useEffect(() => {
    if (!questionId || !config) return;
    if (hydratedForQuestionRef.current === questionId) return;

    hydratedForQuestionRef.current = questionId;

    const { currentChartType, allowed_chart } = config;

    if (allowed_chart?.includes(currentChartType))
      setChartType(currentChartType);
    else if (allowed_chart?.length) setChartType(allowed_chart[0]);
    else setChartType("bar");

    setFilter(config.currentFilter ?? "standard");
    setIsSorted(config.currentSorted ?? false);
  }, [questionId, config]);

  /**
   * ✅ Apply realtime, mais seulement si différent de l’état “source of truth” (config)
   * Donc après que le parent ait appliqué, on n’envoie plus rien.
   */
  const lastAppliedRef = useRef<string>("");

  useEffect(() => {
    if (!questionId || !onApply || !config) return;

    const parentFilter = config.currentFilter ?? "standard";
    const parentSorted = config.currentSorted ?? false;
    const parentChart = config.currentChartType;

    const sameAsParent =
      filter === parentFilter &&
      isSorted === parentSorted &&
      chartType === parentChart;

    if (sameAsParent) return;

    const key = `${questionId}|${filter}|${chartType}|${isSorted}`;
    if (lastAppliedRef.current === key) return;
    lastAppliedRef.current = key;

    onApply({ questionId, filter, chartType, isSorted });
  }, [questionId, filter, chartType, isSorted, onApply, config]);

  const onClose = (open: boolean) => {
    if (!open) {
      setQuestionId("");
      hydratedForQuestionRef.current = "";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {t("missions.boards.modals.filterChangeChartType.title")}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="flex flex-col gap-2">
            <Label>
              {t("missions.boards.modals.filterChangeChartType.filter")}
            </Label>
            <Select
              value={filter}
              onValueChange={(v) => setFilter(v as FilterId)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un filtre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">
                  {t("missions.boards.modals.filterChangeChartType.standard")}
                </SelectItem>
                <SelectItem value="age">
                  {t("missions.boards.modals.filterChangeChartType.age")}
                </SelectItem>
                <SelectItem value="gender">
                  {t("missions.boards.modals.filterChangeChartType.gender")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              {t("missions.boards.modals.filterChangeChartType.visualization")}
            </Label>
            <Select
              value={chartType}
              onValueChange={(v) => setChartType(v as VisualizationId)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t(
                    "missions.boards.modals.filterChangeChartType.visualization"
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {availableVisualizations.map((viz) => (
                  <SelectItem key={viz.id} value={viz.id}>
                    {t(viz.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="is_sorted">
                {t(
                  "missions.boards.modals.filterChangeChartType.sortResponses"
                )}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t(
                  "missions.boards.modals.filterChangeChartType.sortResponsesDescription"
                )}
              </p>
            </div>
            <Switch
              id="is_sorted"
              checked={isSorted}
              onCheckedChange={setIsSorted}
            />
          </div>
        </div>

        <SheetFooter className="mt-8">
          <Button variant="secondary" onClick={() => setQuestionId("")}>
            {t("common.close")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
