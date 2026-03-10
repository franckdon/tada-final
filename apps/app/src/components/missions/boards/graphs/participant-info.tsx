"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { FC } from "react";
import { DataKey } from "recharts/types/util/types";
import { BarChartCardProps } from "./type";

export const ParticipantInfo: FC<
  Omit<BarChartCardProps, "primaryDataKey"> & {
    dates: string;
    locations: string[];
    averageAge: number;
    subDashboardItemId: string;
  }
> = ({
  config,
  data,
  categoryKey = "month",
  primaryKeys,
  label = "key",
  participantCount,
  dates,
  averageAge,
}) => {
  const safeAverageAge = Number.isFinite(averageAge)
    ? Math.round(averageAge)
    : 0;

  return (
    <div>
      <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div className="flex flex-col gap-3">
          <span className="text-2xl font-semibold text-gray-900">
            Durée de l'étude
          </span>
          <span className="text-base text-gray-500">{dates}</span>
        </div>

        <div className="flex flex-wrap gap-8">
          <div className="flex items-end gap-2">
            <p className="text-5xl font-bold text-gray-900">
              {participantCount ?? 0}
            </p>
            <p className="mb-1 text-gray-500">Participants</p>
          </div>

          <div className="flex items-end gap-2">
            <p className="text-5xl font-bold text-gray-900">{safeAverageAge}</p>
            <p className="mb-1 text-gray-500">Âge moyen</p>
          </div>
        </div>
      </div>

      <span className="text-3xl text-gray-900">Âge et genre</span>

      <ChartContainer className="mx-auto w-full max-h-[350px]" config={config}>
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
          barCategoryGap={0}
          maxBarSize={60}
        >
          <XAxis type="number" domain={[0, "dataMax"]} hide />
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
                  className="fill-white"
                  fontSize={12}
                  fontWeight="bold"
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
                        x={x + 8}
                        y={y + height / 2}
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
    </div>
  );
};
