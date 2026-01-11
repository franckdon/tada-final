"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
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
import { useQueryState } from "nuqs";
import { CardHeaderChart } from "./ui/card-header";

export const BarChartHorizontalCard: FC<BarChartCardProps> = ({
  config,
  data,
  categoryKey = "month",
  primaryDataKey = "desktop",
  title,
  description,
  participationQuestions,
  onDelete,
  isDeletable,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const [_, setQuestionId] = useQueryState("questionId", {
    defaultValue: "",
  });

  const handleExportCSV = () => {
    if (!data || data.length === 0) return;

    const headers = [categoryKey, primaryDataKey];
    const csvContent = [
      headers.join(","), // ligne d'en-tête
      ...data.map((row: any) => `${row[categoryKey]},${row[primaryDataKey]}`), // les lignes
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `question-${primaryDataKey}.csv`);
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardHeaderChart
          participationQuestions={participationQuestions}
          title={title}
          isDeletable={isDeletable}
          onDelete={onDelete}
          chartRef={chartRef}
          handleExportCsv={handleExportCSV}
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
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey={categoryKey}
              type="category"
              tickLine={false}
              tickMargin={2}
              axisLine={false}
              tickFormatter={(value) => value}
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
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
