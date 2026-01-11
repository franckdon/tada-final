"use client";

import { Bar, BarChart, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
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
import { Button } from "@tada/ui/components/button";
import { DataKey } from "recharts/types/util/types";
import { BarChartCardProps } from "./type";
import { CardHeaderChart } from "./ui/card-header";

export const BarChartStackedCard: FC<
  Omit<BarChartCardProps, "primaryDataKey">
> = ({
  config,
  data,
  categoryKey = "month",
  title,
  description,
  participationQuestions,
  primaryKeys,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const exportAsCSV = (data: any[], fileName: string) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((key) => JSON.stringify(row[key])).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${fileName}.csv`);
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardHeaderChart
          participationQuestions={participationQuestions}
          title={title}
          exportTargetId={`chart-${title}`}
          chartRef={undefined}
          handleExportCsv={() => exportAsCSV(data, title)}
        />
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="mx-auto aspect-square w-full max-h-[350px]"
          config={config}
          id={`chart-${title}`}
          ref={chartRef}
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 100,
              bottom: 5,
            }}
            barCategoryGap={0} // Supprime l'espace entre les groupes de barres
            barGap={0} // Supprime l'espace entre les barres empilées
            maxBarSize={80} // Augmenté pour correspondre au barSize
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
            {primaryKeys?.map((key, index) => (
              <Bar
                dataKey={key as DataKey<any>}
                fill={`var(--color-${key})`}
                style={{ fill: `var(--color-${key}) !important` }}
                key={key}
                stackId="a"
                radius={
                  index === 0
                    ? [0, 0, 5, 5]
                    : index === primaryKeys.length - 1
                    ? [5, 5, 0, 0]
                    : 0
                }
              >
                <LabelList
                  dataKey={key as DataKey<any>}
                  position="insideLeft"
                  offset={8}
                  className="fill-[--color-label]"
                  fontSize={12}
                  content={(value) => {
                    const { x, y, height } = value as {
                      x: number;
                      y: number;
                      height: number;
                    };
                    return (
                      <text
                        x={x! + 8}
                        y={y! + height! / 2}
                        textAnchor="start"
                        dominantBaseline="middle"
                        className="fill-[--color-label]"
                        fontSize={12}
                      >
                        {config[key]?.label || key}
                      </text>
                    );
                  }}
                />
              </Bar>
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
