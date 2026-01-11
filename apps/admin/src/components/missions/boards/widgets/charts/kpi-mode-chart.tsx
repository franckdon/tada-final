import React, { useEffect, useState, useRef } from "react";
import { Chip, Progress, Tooltip } from "@heroui/react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getWidthBreakpoint } from "@/constants/layout-breakpoints";
import determineType from "@/constants/chart";

interface ChartDatasetConfig {
  datasetColor: string;
}

interface GrowthData {
  status: "positive" | "negative" | "neutral";
  comparison: number;
}

interface Goal {
  goalIndex: number;
  max: number;
  value: number;
  formattedMax: string;
}

interface ChartData {
  data: {
    datasets: Array<{
      label: string;
      data: number[];
    }>;
    goals?: Goal[];
    growth?: GrowthData[];
  };
}

interface Chart {
  chartData: ChartData;
  ChartDatasetConfigs: ChartDatasetConfig[];
  showGrowth?: boolean;
  timeInterval: string;
}

interface KpiModeProps {
  chart: Chart;
}

export function KpiMode({ chart }: KpiModeProps) {
  const [chartSize, setChartSize] = useState<number>(2);
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setIsCompact(
          containerRef.current.offsetWidth < 300 ||
            containerRef.current.offsetHeight < 200
        );
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    switch (getWidthBreakpoint(containerRef)) {
      case "xxs":
      case "xs":
        setChartSize(1);
        break;
      case "sm":
        setChartSize(2);
        break;
      case "md":
        setChartSize(3);
        break;
      case "lg":
        setChartSize(4);
        break;
    }
  }, [containerRef.current]);

  const getKpi = (data: number[]): string => {
    let finalData;
    if (data && Array.isArray(data)) {
      for (let i = data.length - 1; i >= 0; i--) {
        if (
          data[i] &&
          (determineType(data[i]) !== "array" ||
            determineType(data[i]) !== "object")
        ) {
          finalData = data[i];
          break;
        }
      }

      if (!finalData) {
        finalData = `${data[data.length - 1]}`;
      }
    }

    if (`${parseFloat(finalData as string)}` === `${finalData}`) {
      return parseFloat(finalData as string)?.toLocaleString();
    }

    return `${finalData}`;
  };

  const renderGrowth = (growth: GrowthData | undefined) => {
    if (!growth) return <span />;
    const { status, comparison } = growth;
    const formattedComparison = Math.abs(
      comparison % 1 === 0
        ? Number(Math.round(comparison).toFixed(0))
        : Number(comparison.toFixed(2))
    );
    return (
      <div>
        <Tooltip
          content={`compared to last ${chart.timeInterval}`}
          placement="bottom"
        >
          <div className="w-full py-1">
            <Chip
              size="sm"
              variant="flat"
              radius="sm"
              color={
                status === "neutral"
                  ? "default"
                  : status === "positive"
                  ? "success"
                  : "danger"
              }
              startContent={
                status === "positive" ? (
                  <ArrowUpRight size={14} />
                ) : status === "negative" ? (
                  <ArrowDownRight size={14} />
                ) : (
                  ""
                )
              }
            >
              {`${formattedComparison}%`}
            </Chip>
          </div>
        </Tooltip>
      </div>
    );
  };

  const hasGoal = (goals: Goal[] | undefined, index: number): boolean => {
    return Boolean(
      goals && goals.length > 0 && goals.find((g) => g.goalIndex === index)
    );
  };

  const renderGoal = (goals: Goal[] | undefined, index: number) => {
    const goal = goals?.find((g) => g.goalIndex === index);
    const color =
      chart.ChartDatasetConfigs[index] &&
      chart.ChartDatasetConfigs[index].datasetColor;
    if (!goal) return <span />;
    const { max, value, formattedMax } = goal;
    if ((!max && max !== 0) || (!value && value !== 0)) return <span />;

    return (
      <div className="pt-2 w-full">
        <div className="flex justify-between mb-1">
          <div className="text-xs text-default-500">{`${(
            (value / max) *
            100
          ).toFixed()}%`}</div>
          <div className="text-xs text-default-500">{formattedMax}</div>
        </div>
        <Progress
          value={value}
          maxValue={max}
          // size="sm"
          className={`[&_.nextui-progress-bar]:bg-[${color}]`}
          aria-label="Goal progress"
        />
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={
        "flex h-full w-full gap-2 items-center justify-center align-middle flex-wrap"
      }
    >
      {!chart?.chartData?.data?.datasets && (
        <div className={`${isCompact ? "p-0" : "p-3"}`}>
          <div className="flex justify-center items-center">
            <span
              className={`${
                chartSize === 1 || chartSize === 2 ? "text-3xl" : "text-4xl"
              } text-default-800 font-bold`}
            >
              {chart.chartData &&
                chart.chartData.data &&
                getKpi(chart.chartData.data.datasets[0]?.data ?? [0])}
            </span>
          </div>
        </div>
      )}
      {chart?.chartData?.data?.datasets.map((dataset, index) => {
        if (isCompact && index > 0) return null;

        return (
          <div
            key={dataset.label}
            className={`p-2 ${
              hasGoal(chart.chartData.data.goals, index) && isCompact
                ? "w-full"
                : ""
            } gap-4`}
          >
            {chart.ChartDatasetConfigs[index] && (
              <div
                className={`flex items-center ${
                  hasGoal(chart.chartData.data.goals, index)
                    ? "justify-start"
                    : "justify-center"
                }`}
              >
                <div
                  className={`mt-${
                    chart.showGrowth ? "[-5px]" : 0
                  } text-center text-default-600`}
                >
                  <span>{dataset.label}</span>
                </div>
              </div>
            )}

            <div
              className={`flex items-center ${
                hasGoal(chart.chartData.data.goals, index)
                  ? "justify-between"
                  : "justify-center"
              } gap-4`}
            >
              <div
                className={`${
                  chartSize === 1 || chartSize === 2 ? "text-3xl" : "text-4xl"
                } text-default-800 font-bold font-tw`}
                key={dataset.label}
              >
                {dataset.data && getKpi(dataset.data)}
              </div>
              {hasGoal(chart.chartData.data.goals, index) &&
                chart.showGrowth &&
                chart.chartData.data.growth && (
                  <div>{renderGrowth(chart.chartData.data.growth[index])}</div>
                )}
            </div>

            {!hasGoal(chart.chartData.data.goals, index) &&
              chart.showGrowth &&
              chart.chartData.data.growth && (
                <div className="flex justify-center items-center">
                  {renderGrowth(chart.chartData.data.growth[index])}
                </div>
              )}

            {hasGoal(chart.chartData.data.goals, index) && (
              <div className="flex justify-center items-center">
                {renderGoal(chart.chartData.data.goals, index)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
