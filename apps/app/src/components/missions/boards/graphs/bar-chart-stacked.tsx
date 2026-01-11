"use client";

import { FC, useRef, useState, useEffect, useMemo } from "react";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import { DataKey } from "recharts/types/util/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { CardHeaderChart } from "./ui/card-header";
import { BarChartCardProps } from "./type";
import { useSetDocumentId, VeltComments } from "@veltdev/react";
import { StackedBarLegend } from "./stacked-bar-legend";

export const BarChartStackedCard: FC<
  Omit<BarChartCardProps, "primaryDataKey"> & {
    max?: number; // gardés pour compat mais non utilisés pour le domaine
    min?: number;
    subDashboardItemId: string;
    handleExportCsv?: () => void;
    onCommentsClick?: () => void;
    commentCount?: number;
  }
> = ({
  config,
  data,
  categoryKey = "month",
  title,
  description,
  participationQuestions,
  primaryKeys,
  label = "key",
  // max = 100,
  // min = 0,
  onDelete,
  isDeletable,
  subDashboardItemId,
  handleExportCsv,
  onCommentsClick,
  commentCount = 0,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  useSetDocumentId(subDashboardItemId);

  const typedData = useMemo(
    () => (data ?? []) as Array<Record<string, any>>,
    [data]
  );

  // 🔹 Si primaryKeys n’est pas fourni, on tente de les déduire du config
  const derivedKeys = useMemo(() => {
    if (primaryKeys && primaryKeys.length > 0) return primaryKeys;
    if (!config) return [] as string[];

    return Object.keys(config).filter((key) => {
      if (key === "value") return false;
      const cfg = (config as any)[key];
      return cfg && typeof cfg === "object";
    });
  }, [primaryKeys, config]);

  // Est-ce que nos données ont réellement ces clés (format “stacké”) ?
  const hasStackShape =
    derivedKeys.length > 0 &&
    typedData.some((row) => derivedKeys.some((k) => k in row));

  // ✅ clés actuellement visibles (pour la légende) – seulement si le format stacké est valide
  const [activeKeys, setActiveKeys] = useState<string[]>(
    hasStackShape ? derivedKeys : []
  );

  useEffect(() => {
    if (hasStackShape) {
      setActiveKeys(derivedKeys);
    } else {
      setActiveKeys([]);
    }
  }, [hasStackShape, derivedKeys.join(",")]);

  const toggleKey = (key: string) => {
    setActiveKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div data-velt-id={`item-${subDashboardItemId}`}>
      <VeltComments />
      <Card className="border-none mx-auto w-full px-4" ref={chartRef}>
        <CardHeader>
          <CardHeaderChart
            participationQuestions={participationQuestions}
            title={title}
            onDelete={onDelete}
            isDeletable={isDeletable}
            chartRef={chartRef}
            subDashboardItemId={subDashboardItemId}
            handleExportCsv={handleExportCsv}
            onCommentsClick={onCommentsClick}
            commentCount={commentCount}
          />
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="pt-0 pb-3">
          {/* 🔹 Légende Appinio uniquement si format stacké valide */}
          {hasStackShape && derivedKeys.length > 0 && (
            <StackedBarLegend
              items={derivedKeys.map((key) => ({
                key,
                label: (config as any)?.[key]?.label ?? key,
                color: (config as any)?.[key]?.color,
              }))}
              activeKeys={activeKeys}
              onToggle={toggleKey}
            />
          )}

          <ChartContainer
            className="mx-auto aspect-square w-full max-h-[350px]"
            config={config}
          >
            <BarChart
              accessibilityLayer
              data={typedData}
              // layout horizontal = barres verticales
              margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
              barCategoryGap={16}
              maxBarSize={60}
            >
              {/* X = catégories, Y = valeurs */}
              <XAxis
                dataKey={categoryKey}
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis type="number" domain={[0, "dataMax"]} />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />

              {/* 🟧 CAS 1 : données stackées (rating) -> plusieurs Bar stackées */}
              {hasStackShape &&
                derivedKeys.map((key, index) =>
                  activeKeys.includes(key) ? (
                    <Bar
                      key={key}
                      dataKey={key as DataKey<any>}
                      fill={
                        (config as any)?.[key]?.color ?? `var(--color-${key})`
                      }
                      stackId="a"
                      radius={
                        index === 0
                          ? [5, 5, 0, 0]
                          : index === derivedKeys.length - 1
                            ? [0, 0, 5, 5]
                            : 0
                      }
                    >
                      {label === "value" ? (
                        <LabelList
                          dataKey={key as DataKey<any>}
                          position="top"
                          className="fill-[--color-label]"
                          fontSize={12}
                        />
                      ) : null}
                    </Bar>
                  ) : null
                )}

              {/* 🟦 CAS 2 : pas de format stacké (checkbox, dropdown, etc.)
                      -> fallback en barres simples sur `value` */}
              {!hasStackShape && (
                <Bar
                  dataKey={"value" as DataKey<any>}
                  fill={(config as any)?.value?.color ?? "hsl(var(--chart-1))"}
                  maxBarSize={60}
                  radius={[5, 5, 5, 5]}
                >
                  <LabelList
                    dataKey={"value" as DataKey<any>}
                    position="top"
                    className="fill-[--color-label]"
                    fontSize={12}
                  />
                </Bar>
              )}
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
