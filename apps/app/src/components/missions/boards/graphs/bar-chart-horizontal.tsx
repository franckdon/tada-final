"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@tada/ui/components/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { FC, useRef } from "react";
import { DataKey } from "recharts/types/util/types";
import { BarChartCardProps } from "./type";
import { CardHeaderChart } from "./ui/card-header";
import {
  useSetDocumentId,
  VeltComments,
  VeltCommentTool,
} from "@veltdev/react";

const formatPct = (v?: number) => {
  if (v == null || Number.isNaN(v)) return "";
  return `${v.toFixed(0)}`;
};

export const BarChartHorizontalCard: FC<
  BarChartCardProps & {
    handleExportCsv?: () => void;
    onCommentsClick?: () => void;
    commentCount?: number;
  }
> = ({
  config,
  data,
  categoryKey = "month",
  primaryDataKey = "desktop",
  title,
  description,
  participationQuestions,
  onDelete,
  isDeletable,
  subDashboardItemId,
  handleExportCsv,
  onCommentsClick,
  commentCount = 0,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  useSetDocumentId(subDashboardItemId);
  const YAxisTick = ({
    x,
    y,
    payload,
  }: {
    x: number;
    y: number;
    payload: { value: string };
  }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={4}
          textAnchor="end"
          className="fill-slate-900"
          fontSize={12}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div data-velt-id={`item-${subDashboardItemId}`}>
      <VeltComments />
      <Card className="border-none mx-auto w-full px-4">
        <div className="py-3">
          <CardHeaderChart
            participationQuestions={participationQuestions}
            title={title}
            isDeletable={isDeletable}
            onDelete={onDelete}
            chartRef={chartRef}
            subDashboardItemId={subDashboardItemId}
            handleExportCsv={handleExportCsv}
            onCommentsClick={onCommentsClick}
            commentCount={commentCount}
          />

          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>

        <CardContent className="pt-0 pb-3">
          <ChartContainer
            className="mx-auto w-full h-[350px]"
            config={config}
            ref={chartRef}
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 80, right: 24 }}
            >
              <YAxis
                dataKey={categoryKey}
                type="category"
                tickLine={false}
                tickMargin={2}
                axisLine={false}
                width={150}
                tick={(props) => <YAxisTick {...props} />}
              />
              <XAxis dataKey={primaryDataKey} type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey={primaryDataKey as DataKey<any>}
                layout="vertical"
                fill={`var(--color-${primaryDataKey})`}
                radius={5}
                barSize={80}
              >
                <LabelList
                  dataKey={primaryDataKey}
                  position="insideLeft"
                  offset={12}
                  className="fill-white"
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
