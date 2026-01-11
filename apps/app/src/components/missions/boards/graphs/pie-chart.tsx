"use client";

import { Label, Pie, PieChart, Sector, Cell } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

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
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { FC, useRef, useState } from "react";
import { BarChartCardProps } from "./type";
import { CardHeaderChart } from "./ui/card-header";
import { useSetDocumentId, VeltComments } from "@veltdev/react";

export const PieChartCard: FC<
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
  participantCount = 1000,
  onDelete,
  isDeletable,
  subDashboardItemId,
  handleExportCsv,
  onCommentsClick,
  commentCount = 0,
}) => {
  const id = "pie-interactive";
  const [activeIndex, setActiveIndex] = useState(-1);
  const chartRef = useRef<HTMLDivElement>(null);
  useSetDocumentId(subDashboardItemId);

  const handleMouseEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(-1);
  };

  // Récupère la couleur dans config pour une catégorie (ex: "Femme", "Homme")
  const getColorForCategory = (category: string): string => {
    const cfg = (config as Record<string, { color?: string }>)[category];
    // Si pas de couleur dans le config, fallback sur chart-1
    return cfg?.color ?? "hsl(var(--chart-1))";
  };

  const typedData = (data ?? []) as Array<Record<string, any>>;

  return (
    <>
      <VeltComments />
      <Card
        data-chart={id}
        className="flex flex-col border-none mx-auto w-full px-4"
        ref={chartRef}
      >
        <ChartStyle id={id} config={config} />
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
            id={`chart-${id}`}
            config={config}
            className="mx-auto aspect-square w-full max-w-[350px] max-h-[350px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={typedData}
                dataKey={primaryDataKey}
                nameKey={categoryKey}
                innerRadius={60}
                strokeWidth={5}
                activeIndex={activeIndex}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                activeShape={({
                  outerRadius = 0,
                  ...props
                }: PieSectorDataItem) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 10} />
                    <Sector
                      {...props}
                      outerRadius={outerRadius + 25}
                      innerRadius={outerRadius + 12}
                    />
                  </g>
                )}
              >
                {/* ✅ Une couleur par entrée, basée sur config */}
                {typedData.map((entry, index) => {
                  const category = String(entry[categoryKey]);
                  return (
                    <Cell
                      key={`${category}-${index}`}
                      fill={getColorForCategory(category)}
                    />
                  );
                })}

                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {participantCount}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            participants
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey={categoryKey} />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
};
