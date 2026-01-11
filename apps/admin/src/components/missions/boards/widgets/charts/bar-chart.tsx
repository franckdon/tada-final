import React, { useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LogarithmicScale,
  ChartData,
  ChartOptions,
} from "chart.js";
import { semanticColors } from "@heroui/react";
import { cloneDeep } from "lodash";
import { useTheme } from "next-themes";
import {
  getHeightBreakpoint,
  getWidthBreakpoint,
} from "@/constants/layout-breakpoints";
import KpiChartSegment from "./kpi-chart-segment";
import ChartErrorBoundary from "./chart-error-boundary";
import { tooltipPlugin } from "./chart-tooltip";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartDataConfig {
  data: ChartData<"bar">;
  options?: ChartOptions<"bar">;
  growth?: number;
}

interface ChartConfig {
  chartData: ChartDataConfig;
  dataLabels?: boolean;
  mode?: "kpichart" | "default";
  xLabelTicks?: "default" | "none";
  horizontal?: boolean;
}

interface BarChartProps {
  chart: ChartConfig;
  redraw?: boolean;
  redrawComplete?: () => void;
  editMode?: boolean;
}

interface DataLabelsContext {
  dataset: {
    backgroundColor: string;
    borderColor: string;
  };
}

const dataLabelsPlugin = {
  font: {
    weight: "bold" as const,
    size: 10,
    family: "Inter",
    color: "white",
  },
  padding: 4,
  borderRadius: 4,
  formatter: Math.round,
};

export default function BarChart({
  chart,
  redraw = false,
  redrawComplete = () => {},
  editMode = false,
}: BarChartProps) {
  const { theme } = useTheme();
  const chartRef = useRef(null);

  useEffect(() => {
    if (redraw) {
      setTimeout(() => {
        redrawComplete();
      }, 1000);
    }
  }, [redraw, redrawComplete]);

  useEffect(() => {
    return () => {
      const tooltipEl = document.getElementById("chartjs-tooltip");
      if (tooltipEl) {
        tooltipEl.remove();
      }
    };
  }, []);

  function getChartOptions(): ChartOptions<"bar"> | undefined {
    // add any dynamic changes to the chartJS options here
    if (chart.chartData?.options) {
      const newOptions = cloneDeep(chart.chartData.options);

      newOptions.plugins = newOptions.plugins || {}; // Ensure plugins object exists

      if (newOptions.scales?.y?.grid) {
        newOptions.scales.y.grid.color = semanticColors[theme].content3.DEFAULT;
      }
      if (newOptions.scales?.x?.grid) {
        newOptions.scales.x.grid.color = semanticColors[theme].content3.DEFAULT;
      }
      if (newOptions.scales?.y?.ticks) {
        newOptions.scales.y.ticks.color =
          semanticColors[theme].foreground.DEFAULT;
      }
      if (newOptions.scales?.x?.ticks) {
        newOptions.scales.x.ticks.color =
          semanticColors[theme].foreground.DEFAULT;
      }
      if (newOptions.plugins?.legend?.labels) {
        newOptions.plugins.legend.labels.color =
          semanticColors[theme].foreground.DEFAULT;
      }

      if (newOptions?.scales?.x?.ticks && newOptions?.scales?.y?.ticks) {
        // sizing changes
        const widthBreakpoint = chart.horizontal
          ? getHeightBreakpoint(chartRef)
          : getWidthBreakpoint(chartRef);
        const heightBreakpoint = chart.horizontal
          ? getWidthBreakpoint(chartRef)
          : getHeightBreakpoint(chartRef);

        if (widthBreakpoint === "xxs" || widthBreakpoint === "xs") {
          newOptions.elements.point.radius = 0;
        } else {
          newOptions.elements.point.radius =
            chart.chartData?.options?.elements?.point?.radius;
        }

        const realX = chart.horizontal ? "y" : "x";
        const realY = chart.horizontal ? "x" : "y";

        if (widthBreakpoint === "xxs" && chart.xLabelTicks === "default") {
          newOptions.scales[realX].ticks.maxTicksLimit = 4;
          newOptions.scales[realX].ticks.maxRotation = 25;
        } else if (
          widthBreakpoint === "xs" &&
          chart.xLabelTicks === "default"
        ) {
          newOptions.scales[realX].ticks.maxTicksLimit = 6;
          newOptions.scales[realX].ticks.maxRotation = 25;
        } else if (
          widthBreakpoint === "sm" &&
          chart.xLabelTicks === "default"
        ) {
          newOptions.scales[realX].ticks.maxTicksLimit = 8;
          newOptions.scales[realX].ticks.maxRotation = 25;
        } else if (
          widthBreakpoint === "md" &&
          chart.xLabelTicks === "default"
        ) {
          newOptions.scales[realX].ticks.maxTicksLimit = 12;
          newOptions.scales[realX].ticks.maxRotation = 90;
        } else if (!chart.xLabelTicks) {
          newOptions.scales[realX].ticks.maxTicksLimit = 16;
        }

        if (heightBreakpoint === "xs") {
          newOptions.scales[realY].ticks.maxTicksLimit = 4;
        } else {
          newOptions.scales[realY].ticks.maxTicksLimit = 10;
        }
      }

      // Check if it's a category chart by looking if any dataset has multiple background colors
      const isCategoryChart = chart.chartData?.data?.datasets?.some(
        (ds) =>
          Array.isArray(ds?.backgroundColor) && ds.backgroundColor?.length > 1
      );

      // Add tooltip configuration
      newOptions.plugins = {
        ...newOptions.plugins,
        tooltip: {
          ...tooltipPlugin,
          isCategoryChart,
        },
      };

      newOptions?.plugins?.datalabels = chart?.dataLabels
        ? _getDatalabelsOptions()
        : { formatter: () => "" };

      return newOptions;
    }

    return chart.chartData?.options;

    /*   if (!chart.chartData?.options) return undefined;

    const newOptions = cloneDeep(chart.chartData.options);

    newOptions.plugins = newOptions.plugins || {};

    if (newOptions.scales?.y?.grid) {
      newOptions.scales.y.grid.color = (
        semanticColors[theme as "light" | "dark"]?.content3 as any
      )?.DEFAULT;
    }
    if (newOptions.scales?.x?.grid) {
      newOptions.scales.x.grid.color = (
        semanticColors[theme as "light" | "dark"]?.content3 as any
      )?.DEFAULT;
    }
    if (newOptions.scales?.y?.ticks) {
      newOptions.scales.y.ticks.color = (
        semanticColors[theme as "light" | "dark"]?.foreground as any
      )?.DEFAULT;
    }
    if (newOptions.scales?.x?.ticks) {
      newOptions.scales.x.ticks.color = (
        semanticColors[theme as "light" | "dark"]?.foreground as any
      )?.DEFAULT;
    }
    if (newOptions.plugins?.legend?.labels) {
      newOptions.plugins.legend.labels.color = (
        semanticColors[theme as "light" | "dark"]?.foreground as any
      )?.DEFAULT;
    }

    if (newOptions?.scales?.x?.ticks && newOptions?.scales?.y?.ticks) {
      const widthBreakpoint = chart.horizontal
        ? getHeightBreakpoint(chartRef)
        : getWidthBreakpoint(chartRef);
      const heightBreakpoint = chart.horizontal
        ? getWidthBreakpoint(chartRef)
        : getHeightBreakpoint(chartRef);

      if (widthBreakpoint === "xxs" || widthBreakpoint === "xs") {
        if (newOptions.elements?.point) {
          newOptions.elements.point.radius = 0;
        }
      } else {
        if (newOptions.elements?.point) {
          newOptions.elements.point.radius =
            chart.chartData?.options?.elements?.point?.radius;
        }
      }
      const realX = chart.horizontal ? "y" : "x";
      const realY = chart.horizontal ? "x" : "y";

      if (widthBreakpoint === "xxs" && chart.xLabelTicks === "default") {
        if (newOptions.scales?.[realX]?.ticks) {
          newOptions.scales[realX].ticks.maxTicksLimit = 4;
          newOptions.scales[realX].ticks.maxRotation = 25;
        }
      } else if (widthBreakpoint === "xs" && chart.xLabelTicks === "default") {
        if (newOptions.scales?.[realX]?.ticks) {
          newOptions.scales[realX].ticks.maxTicksLimit = 6;
          newOptions.scales[realX].ticks.maxRotation = 25;
        }
      } else if (widthBreakpoint === "sm" && chart.xLabelTicks === "default") {
        if (newOptions.scales?.[realX]?.ticks) {
          newOptions.scales[realX].ticks.maxTicksLimit = 8;
          newOptions.scales[realX].ticks.maxRotation = 25;
        }
      } else if (widthBreakpoint === "md" && chart.xLabelTicks === "default") {
        if (newOptions.scales?.[realX]?.ticks) {
          newOptions.scales[realX].ticks.maxTicksLimit = 12;
          newOptions.scales[realX].ticks.maxRotation = 90;
        } else if (!chart.xLabelTicks) {
          if (newOptions.scales?.[realX]?.ticks) {
            newOptions.scales[realX].ticks.maxTicksLimit = 16;
          }
        }
      }

      if (heightBreakpoint === "xs") {
        if (newOptions.scales?.[realY]?.ticks) {
          newOptions.scales[realY].ticks.maxTicksLimit = 4;
        }
      } else {
        if (newOptions.scales?.[realY]?.ticks) {
          newOptions.scales[realY].ticks.maxTicksLimit = 10;
        }
      }
    }

    const isCategoryChart = chart.chartData?.data?.datasets?.some(
      (ds) =>
        Array.isArray(ds?.backgroundColor) && ds.backgroundColor?.length > 1
    );

    newOptions.plugins = {
      ...newOptions.plugins,
      tooltip: {
        ...tooltipPlugin,
        isCategoryChart,
      } as any,
      datalabels: chart?.dataLabels
        ? dataLabelsPlugin
        : { formatter: () => "" },
    };

    return newOptions; */
  }

  const _getDatalabelsOptions = () => {
    return {
      font: {
        weight: "bold",
        size: 10,
        family: "Inter",
        color: "white",
      },
      padding: 4,
      borderRadius: 4,
      formatter: Math.round,
    };
  };

  function getChartData(): ChartData<"bar"> | null {
    if (!chart?.chartData?.data) return null;
    if (!chart?.chartData?.data?.datasets) return chart.chartData.data;

    const newChartData = cloneDeep(chart.chartData.data);

    newChartData?.datasets?.forEach((dataset, index) => {
      if (
        dataset?.datalabels &&
        index === chart.chartData.data.datasets.length - 1
      ) {
        newChartData.datasets[index].datalabels.color =
          semanticColors[theme].default[800];
      }
    });

    return newChartData;
  }

  return (
    <>
      {chart.chartData && chart.chartData.data && (
        <div className="h-full" ref={chartRef}>
          {chart.chartData.growth && chart.mode === "kpichart" && (
            <KpiChartSegment
              chart={chart.chartData as any}
              editMode={editMode}
            />
          )}
          {chart.chartData.data && chart.chartData.data.labels && (
            <div
              className={
                chart.mode !== "kpichart" ? "h-full" : "h-full pb-[50px]"
              }
            >
              <ChartErrorBoundary>
                <Bar
                  data={getChartData() || { labels: [], datasets: [] }}
                  options={getChartOptions()}
                  redraw={redraw}
                  plugins={chart.dataLabels ? [ChartDataLabels] : []}
                />
              </ChartErrorBoundary>
            </div>
          )}
        </div>
      )}
    </>
  );
}
