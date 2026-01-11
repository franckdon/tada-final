import React, { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LogarithmicScale,
  ChartData,
  ChartOptions,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { cloneDeep } from "lodash";

import { useTheme } from "next-themes";
import { tooltipPlugin } from "./chart-tooltip";
import { chartColors } from "@/constants/chart";
import ChartErrorBoundary from "./chart-error-boundary";
import {
  getHeightBreakpoint,
  getWidthBreakpoint,
} from "@/constants/layout-breakpoints";
import KpiChartSegment from "./kpi-chart-segment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartDataConfig {
  data: ChartData<"line">;
  options?: ChartOptions<"line">;
  growth?: number;
}

interface ChartConfig {
  chartData: ChartDataConfig;
  dataLabels?: boolean;
  dashedLastPoint?: boolean;
  mode?: "kpichart" | "default";
  xLabelTicks?: "default" | "none";
}

interface LineChartProps {
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
  },
  padding: 4,
  backgroundColor(context: DataLabelsContext) {
    if (
      context.dataset.backgroundColor === "transparent" ||
      context.dataset.backgroundColor === "rgba(0,0,0,0)"
    ) {
      return context.dataset.borderColor;
    }
    return context.dataset.backgroundColor;
  },
  borderRadius: 4,
  color: "white",
  formatter: Math.round,
};

export function LineChart({
  chart,
  redraw = false,
  redrawComplete = () => {},
  editMode = false,
}: LineChartProps) {
  const { theme } = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);

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

  function getChartOptions(): ChartOptions<"line"> | undefined {
    if (!chart.chartData?.options) return undefined;

    const newOptions = cloneDeep(chart.chartData.options);
    newOptions.plugins = newOptions.plugins || {};

    // Theme-based styling
    if (newOptions.scales?.y?.grid) {
      newOptions.scales.y.grid.color = theme === "dark" ? "#374151" : "#E5E7EB";
    }
    if (newOptions.scales?.x?.grid) {
      newOptions.scales.x.grid.color = theme === "dark" ? "#374151" : "#E5E7EB";
    }
    if (newOptions.scales?.y?.ticks) {
      newOptions.scales.y.ticks.color = theme === "dark" ? "#fff" : "#000";
    }
    if (newOptions.scales?.x?.ticks) {
      newOptions.scales.x.ticks.color = theme === "dark" ? "#fff" : "#000";
    }
    if (newOptions.plugins?.legend?.labels) {
      newOptions.plugins.legend.labels.color =
        theme === "dark" ? "#fff" : "#000";
    }

    // Responsive sizing
    if (
      newOptions?.scales?.x?.ticks &&
      newOptions?.scales?.y?.ticks &&
      chartRef.current
    ) {
      const widthBreakpoint = getWidthBreakpoint(chartRef);
      const heightBreakpoint = getHeightBreakpoint(chartRef);

      if (widthBreakpoint === "xxs" || widthBreakpoint === "xs") {
        newOptions.elements = {
          ...newOptions.elements,
          point: { radius: 0 },
        };
      }

      if (chart.xLabelTicks === "default") {
        const tickConfig = {
          xxs: { maxTicksLimit: 4, maxRotation: 25 },
          xs: { maxTicksLimit: 6, maxRotation: 25 },
          sm: { maxTicksLimit: 8, maxRotation: 25 },
          md: { maxTicksLimit: 12, maxRotation: 45 },
        };

        const config = tickConfig[widthBreakpoint as keyof typeof tickConfig];
        if (config) {
          newOptions.scales.x.ticks = {
            ...newOptions.scales.x.ticks,
            ...config,
          };
        }
      }

      newOptions.scales.y.ticks.maxTicksLimit =
        heightBreakpoint === "xs" ? 4 : 10;
    }

    // Plugin configuration
    newOptions.plugins = {
      ...newOptions.plugins,
      tooltip: tooltipPlugin,
      datalabels: chart?.dataLabels
        ? dataLabelsPlugin
        : { formatter: () => "" },
    } as any;

    // Interaction configuration
    newOptions.hover = {
      mode: "index",
      intersect: false,
    };

    newOptions.interaction = {
      mode: "index",
      intersect: false,
    };

    return newOptions;
  }

  function getChartData(): ChartData<"line"> | null {
    if (!chart.chartData?.data?.datasets) return null;

    const newData = cloneDeep(chart.chartData.data);

    if (chart.dashedLastPoint) {
      newData.datasets = newData.datasets.map((dataset) => ({
        ...dataset,
        segment: {
          borderDash: (ctx: { p1DataIndex: number }) => {
            const dataLength = dataset.data?.length || 0;
            return dataLength === 0
              ? []
              : ctx.p1DataIndex === dataLength - 1
              ? [5, 10]
              : [];
          },
        },
      }));
    }

    return newData;
  }

  if (!chart.chartData?.data) return null;

  return (
    <div className="h-full" ref={chartRef}>
      {chart.chartData.growth && chart.mode === "kpichart" && (
        <KpiChartSegment chart={chart.chartData as any} editMode={editMode} />
      )}
      {chart.chartData.data.labels && (
        <div
          className={chart.mode !== "kpichart" ? "h-full" : "h-full pb-[50px]"}
        >
          <ChartErrorBoundary>
            <Line
              data={getChartData() || { labels: [], datasets: [] }}
              options={getChartOptions()}
              redraw={redraw}
              plugins={chart.dataLabels ? [ChartDataLabels] : []}
            />
          </ChartErrorBoundary>
        </div>
      )}
    </div>
  );
}
