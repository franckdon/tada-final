"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { FC, useRef } from "react";
import { DataKey } from "recharts/types/util/types";
import { BarChartCardProps } from "./type";
import { CardHeaderChart } from "./ui/card-header";
import { useSetDocumentId, VeltComments } from "@veltdev/react";

export const RadarChartCard: FC<
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
  const id = "radar-interactive";
  const chartRef = useRef<HTMLDivElement>(null);
  useSetDocumentId(subDashboardItemId);

  const typedData = (data ?? []) as Array<Record<string, any>>;

  return (
    <>
      <VeltComments />
      <Card
        ref={chartRef}
        data-chart={id}
        className="flex flex-col border-none mx-auto w-full px-4"
      >
        <CardHeader>
          <CardHeaderChart
            participationQuestions={participationQuestions}
            title={title}
            onDelete={onDelete}
            isDeletable={isDeletable}
            exportTargetId={`chart-${id}`}
            chartRef={chartRef}
            subDashboardItemId={subDashboardItemId}
            handleExportCsv={handleExportCsv}
            onCommentsClick={onCommentsClick}
            commentCount={commentCount}
          />
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-1 justify-center pb-3 pt-0">
          <ChartContainer
            config={config}
            id={`chart-${id}`}
            className="mx-auto aspect-square w-full max-w-[350px] max-h-[350px]"
          >
            <RadarChart data={typedData}>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelKey={categoryKey}
                  />
                }
              />
              <PolarGrid gridType="circle" />
              <PolarAngleAxis dataKey={categoryKey} />
              <Radar
                dataKey={primaryDataKey as DataKey<any>}
                fill={`var(--color-${primaryDataKey})`}
                fillOpacity={0.6}
                dot={{
                  r: 4,
                  fillOpacity: 1,
                }}
              />
              <PolarRadiusAxis
                angle={60}
                stroke="hsla(var(--foreground))"
                orientation="middle"
                axisLine={false}
              />
            </RadarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
};
