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
import { Badge } from "@tada/ui/components/badge";

export const ParticipantInfo: FC<
  Omit<BarChartCardProps, "primaryDataKey"> & {
    dates: string;
    locations: string[];
    averageAge: number;
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
  participantCount,
  dates,
  locations = [],
  averageAge,
}) => {
  return (
    <div className="">
      <div>
        <div className="max-w-3xl mb-16">
          <h1 className="text-7xl md:text-7xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          <div className=" flex flex-wrap gap-2">
            {locations.map((location) => (
              <Badge variant="outline">{location}</Badge>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-between mb-12">
        <div className="flex flex-col gap-6">
          <span className="text-3xl text-gray-900">Durée de l'étude</span>
          <span className="text-xl text-gray-500">{dates}</span>
        </div>
        <div className="flex flex-row space-x-8 ">
          <div className="flex gap-2 border-gray-200 py-6">
            <p className="text-5xl font-bold text-gray-900">
              {participantCount}
            </p>
            <p className="text-gray-500 mt-auto">Participants</p>
          </div>
          <div className="py-6 flex gap-2">
            <p className="text-5xl font-bold text-gray-900">{averageAge}</p>
            <p className="text-gray-500 mt-auto">Âge moyen</p>
          </div>
        </div>
      </div>

      <span className="text-3xl text-gray-900">Âge et genre</span>
      <ChartContainer
        className="aspect-square w-full max-h-[350px]  mx-auto "
        config={config}
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
          barCategoryGap={0}
          maxBarSize={60}
        >
          <XAxis domain={[0, 100]} type="number" hide />
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
    </div>
  );
};
