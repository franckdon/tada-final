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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { FC, useRef } from "react";
import { DataKey } from "recharts/types/util/types";
import { Button } from "@tada/ui/components/button";
import { BarChartCardProps } from "./type";
import { CardHeaderChart } from "./ui/card-header";

export const RadarChartCard: FC<BarChartCardProps> = ({
  config,
  data,
  categoryKey = "month",
  primaryDataKey = "desktop",
  title,
  description,
  participationQuestions,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  return (
    <Card>
      <CardHeader>
        <CardHeaderChart
          participationQuestions={participationQuestions}
          title=""
          chartRef={chartRef}
        />
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[350px]"
          ref={chartRef}
        >
          <RadarChart data={data}>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent indicator="line" labelKey={categoryKey} />
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
  );
};
