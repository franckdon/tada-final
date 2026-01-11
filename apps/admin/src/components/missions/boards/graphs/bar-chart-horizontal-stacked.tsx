"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { FC, useRef } from "react";
import { DataKey } from "recharts/types/util/types";
import { Button } from "@tada/ui/components/button";
import { BarChartCardProps } from "./type";
import { CardHeaderChart } from "./ui/card-header";

export const BarChartHorizontalStackedCard: FC<
  Omit<BarChartCardProps, "primaryDataKey"> & {
    max?: number;
    min?: number;
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
  max = 100,
  min = 0,
  onDelete,
  isDeletable,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const exportChartDataAsCSV = (
    data: any[],
    primaryKeys: string[],
    categoryKey: string,
    filename: string
  ) => {
    const header = [categoryKey, ...primaryKeys].join(",") + "\n";
    const rows = data
      .map((item) =>
        [item[categoryKey], ...primaryKeys.map((key) => item[key])].join(",")
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardHeaderChart
          participationQuestions={participationQuestions}
          title={title}
          onDelete={onDelete}
          isDeletable={isDeletable}
          chartRef={chartRef}
          handleExportCsv={() =>
            exportChartDataAsCSV(
              data,
              primaryKeys ?? [],
              categoryKey,
              title || "chart-data"
            )
          }
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
              top: 20,
              right: 30,
              left: 100,
              bottom: 5,
            }}
            barCategoryGap={0} // Supprime l'espace entre les groupes de barres
            maxBarSize={60} // Limite la taille maximale des barres
          >
            <XAxis domain={[min, max]} type="number" hide />
            <YAxis
              dataKey={categoryKey}
              type="category"
              tickLine={false}
              tickMargin={2}
              axisLine={false}
              tickFormatter={(value) => value}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            {primaryKeys?.map((key, index) => (
              <Bar
                dataKey={key as DataKey<any>}
                layout="vertical"
                fill={`var(--color-${key})`}
                key={key}
                stackId="a"
                barSize={80}
                radius={
                  index === 0
                    ? [5, 0, 0, 5]
                    : index === primaryKeys.length - 1
                    ? [0, 5, 5, 0]
                    : 0
                }
              >
                {label === "value" ? (
                  <LabelList
                    dataKey={key as DataKey<any>}
                    position="insideLeft"
                    offset={8}
                    className="fill-[--color-label]"
                    fontSize={12}
                  />
                ) : (
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
                )}
              </Bar>
            ))}

            <ChartLegend
              content={<ChartLegendContent />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
