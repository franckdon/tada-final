"use client";

import { Bar, BarChart, LabelList, XAxis } from "recharts";

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

export const BarChartCard: FC<BarChartCardProps> = ({
  config,
  data,
  categoryKey = "month",
  primaryDataKey = "desktop",
  title,
  description,
  participationQuestions,
  primaryKeys,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardHeaderChart
          participationQuestions={participationQuestions}
          title={title}
          chartRef={chartRef}
        />
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="mx-auto aspect-square w-full max-h-[350px]"
          config={config}
          ref={chartRef}
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
            }}
          >
            <XAxis
              dataKey={categoryKey}
              tickLine={false}
              tickMargin={2}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            {primaryKeys && primaryKeys.length > 0
              ? primaryKeys.map((key) => (
                  <Bar
                    dataKey={key as DataKey<any>}
                    fill={`var(--color-${key})`}
                    radius={5}
                    barSize={80}
                    key={key}
                  >
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Bar>
                ))
              : null}
            {!primaryKeys && (
              <Bar
                dataKey={primaryDataKey as DataKey<any>}
                fill={`var(--color-${primaryDataKey})`}
                radius={5}
                barSize={80}
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
