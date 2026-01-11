"use client";

import { FC, useEffect, useMemo, useRef, useState } from "react";
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

const formatPct = (v?: number) => {
  if (v == null || Number.isNaN(v)) return "";
  return `${Number(v).toFixed(1)}%`;
};

export const BarChartHorizontalStackedCard: FC<
  Omit<BarChartCardProps, "primaryDataKey"> & {
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

  const derivedKeys = useMemo(() => {
    if (primaryKeys?.length) return primaryKeys;
    if (!config) return [] as string[];
    return Object.keys(config).filter(
      (key) => key !== "value" && !!(config as any)[key]
    );
  }, [primaryKeys, config]);

  const [activeKeys, setActiveKeys] = useState<string[]>(derivedKeys);

  useEffect(() => {
    setActiveKeys(derivedKeys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedKeys.join(",")]);

  const toggleKey = (key: string) => {
    setActiveKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // ✅ Normalisation Appinio: chaque ligne devient une distribution en %
  // - on garde les bruts pour tooltip (optionnel)
  const normalized = useMemo(() => {
    const rows = typedData.map((row) => {
      const rawTotal = activeKeys.reduce(
        (acc, k) => acc + (Number(row?.[k]) || 0),
        0
      );

      const next: Record<string, any> = { ...row };

      // store raw totals (utile tooltip)
      next.__rawTotal = rawTotal;

      // percent per key
      activeKeys.forEach((k) => {
        const raw = Number(row?.[k]) || 0;
        next[`__raw_${k}`] = raw; // optionnel tooltip
        next[k] = rawTotal > 0 ? (raw / rawTotal) * 100 : 0;
      });

      // total affiché à droite
      next.__total = rawTotal > 0 ? 100 : 0;

      return next;
    });

    return rows;
  }, [typedData, activeKeys]);

  const legendItems = useMemo(() => {
    return derivedKeys.map((key) => ({
      key,
      label: (config as any)?.[key]?.label ?? key,
      color: (config as any)?.[key]?.color ?? `var(--color-${key})`,
    }));
  }, [derivedKeys, config]);

  return (
    <div data-velt-id={`item-${subDashboardItemId}`}>
      <VeltComments />

      <Card className="border-none w-full" ref={chartRef}>
        <CardHeader className="px-4 pt-4 pb-2">
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
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? (
            <CardDescription className="text-sm">{description}</CardDescription>
          ) : null}
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-2 space-y-3">
          {/* Legend chips */}
          {legendItems.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 thin-scrollbar">
              {legendItems.map((it) => {
                const active = activeKeys.includes(it.key);
                return (
                  <button
                    key={it.key}
                    type="button"
                    onClick={() => toggleKey(it.key)}
                    className={[
                      "shrink-0 rounded-full border px-3 py-1 text-xs transition",
                      active
                        ? "border-slate-300 bg-white text-slate-900"
                        : "border-slate-200 bg-slate-50 text-slate-500 opacity-70",
                    ].join(" ")}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full align-middle mr-2"
                      style={{ background: it.color }}
                    />
                    {it.label}
                  </button>
                );
              })}
            </div>
          )}

          <ChartContainer className="w-full h-[340px]" config={config}>
            <BarChart
              accessibilityLayer
              data={normalized}
              layout="vertical"
              margin={{ top: 8, right: 28, left: 16, bottom: 8 }}
              barCategoryGap={10}
              maxBarSize={44}
            >
              {/* ✅ distribution en % */}
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis
                dataKey={categoryKey}
                type="category"
                width={120}
                tickLine={false}
                axisLine={false}
                tickMargin={6}
              />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />

              {/* Stacks (en %) */}
              {derivedKeys.map((key, idx) =>
                activeKeys.includes(key) ? (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={(config as any)?.[key]?.color}
                    radius={
                      idx === 0
                        ? [8, 0, 0, 8]
                        : idx === derivedKeys.length - 1
                          ? [0, 8, 8, 0]
                          : 0
                    }
                  >
                    <LabelList
                      dataKey={key}
                      position="center"
                      className="fill-white"
                      fontSize={12}
                      formatter={(v: any) => (v > 5 ? `${v.toFixed(0)}%` : "")}
                    />
                  </Bar>
                ) : null
              )}

              {/* Total à droite (100%) */}
              <Bar
                dataKey="__total"
                stackId="__total-hidden"
                fill="transparent"
              >
                <LabelList
                  dataKey="__total"
                  position="right"
                  offset={10}
                  className="fill-slate-600"
                  fontSize={12}
                  formatter={(v: any) => formatPct(Number(v))}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
