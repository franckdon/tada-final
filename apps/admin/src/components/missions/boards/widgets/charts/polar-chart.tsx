import React, { useEffect } from "react";
import { PolarArea } from "react-chartjs-2";
import { semanticColors } from "@heroui/react";
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
  ChartData,
  ChartOptions,
} from "chart.js";
import { cloneDeep } from "lodash";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useTheme } from "next-themes";
import { tooltipPlugin } from "./chart-tooltip";
import { chartColors } from "@/constants/chart";
import ChartErrorBoundary from "./chart-error-boundary";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DataLabelsContext {
  chart: {
    _hiddenIndices: Record<number, boolean>;
  };
  dataset: {
    data: Array<number | string>;
  };
  dataIndex: number;
}

interface DataLabelsPluginOptions {
  color: string;
  font: {
    weight: "bold";
    size: number;
    family: string;
  };
  padding: number;
  formatter: (value: number | string, context: DataLabelsContext) => string;
  display: (context: DataLabelsContext) => boolean;
  backgroundColor: string;
  borderRadius: number;
}

const dataLabelsPlugin: DataLabelsPluginOptions = {
  color: "#fff",
  font: {
    weight: "bold",
    size: 10,
    family: "Inter",
  },
  padding: 2,
  formatter: (value: number | string, context: DataLabelsContext) => {
    let formattedValue = value;
    try {
      formattedValue = parseFloat(value as string);
    } catch (e) {
      // do nothing
    }

    const hiddens = context.chart._hiddenIndices;
    let total = 0;
    const datapoints = context.dataset.data;
    datapoints.forEach((val, i) => {
      let formattedVal = val;
      try {
        formattedVal = parseFloat(val as string);
      } catch (e) {
        // do nothing
      }
      if (hiddens[i] !== undefined) {
        if (!hiddens[i]) {
          total += formattedVal as number;
        }
      } else {
        total += formattedVal as number;
      }
    });

    const percentage = `${(((formattedValue as number) / total) * 100).toFixed(
      2
    )}%`;
    return percentage;
  },
  display(context: DataLabelsContext) {
    const { dataset } = context;
    const count = dataset.data.length;
    const value = dataset.data[context.dataIndex];
    return (value as number) > count * 1.5;
  },
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  borderRadius: 4,
};

interface PolarChartProps {
  chart: {
    chartData: {
      data: ChartData<"polarArea">;
      options?: ChartOptions<"polarArea">;
    };
    dataLabels?: boolean;
  };
  redraw?: boolean;
  redrawComplete?: () => void;
}

export function PolarChart({
  chart,
  redraw = false,
  redrawComplete = () => {},
}: PolarChartProps) {
  const { theme } = useTheme();

  // Add cleanup effect
  useEffect(() => {
    return () => {
      const tooltipEl = document.getElementById("chartjs-tooltip");
      if (tooltipEl) {
        tooltipEl.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (redraw) {
      setTimeout(() => {
        redrawComplete();
      }, 1000);
    }
  }, [redraw, redrawComplete]);

  function getChartOptions(): ChartOptions<"polarArea"> | undefined {
    if (!chart.chartData?.options) return undefined;

    const newOptions = cloneDeep(chart.chartData.options);

    if (newOptions.scales) {
      newOptions.scales = {
        r: {
          grid: {
            color: (semanticColors[theme as "light" | "dark"]?.content4 as any)
              ?.DEFAULT,
          },
          angleLines: {
            color: (semanticColors[theme as "light" | "dark"]?.content4 as any)
              ?.DEFAULT,
          },
          pointLabels: {
            color: (
              semanticColors[theme as "light" | "dark"]?.foreground as any
            )?.DEFAULT,
          },
        },
      };
    }

    if (newOptions.plugins?.legend?.labels) {
      newOptions.plugins.legend.labels.color = (
        semanticColors[theme as "light" | "dark"]?.foreground as any
      )?.DEFAULT;
    }

    newOptions.plugins = {
      ...newOptions.plugins,
      tooltip: {
        ...tooltipPlugin,
        isCategoryChart: true,
      },
      datalabels: chart?.dataLabels
        ? dataLabelsPlugin
        : { formatter: () => "" },
    } as any;

    return newOptions;
  }

  function getChartData(): ChartData<"polarArea"> | null {
    const data = cloneDeep(chart.chartData.data);
    if (!data) return null;

    const numSegments = data.labels?.length || 0;
    if (numSegments === 0) return data;

    data.datasets = data.datasets.map((dataset) => {
      if (dataset.backgroundColor && Array.isArray(dataset.backgroundColor)) {
        return dataset;
      }

      const colors = Object.values(chartColors).map((c) => c.hex);
      dataset.backgroundColor = Array(numSegments)
        .fill(null)
        .map((_, i) => {
          const existingColor = (dataset as any).fillColor?.[i];
          if (
            existingColor &&
            existingColor !== "transparent" &&
            existingColor !== null
          ) {
            return existingColor;
          }
          return colors[i % colors.length];
        });

      return dataset;
    });

    return data;
  }

  return (
    <div className="h-full">
      {chart.chartData.data && chart.chartData.data.labels && (
        <ChartErrorBoundary>
          <PolarArea
            data={getChartData() || { labels: [], datasets: [] }}
            options={getChartOptions()}
            redraw={redraw}
            plugins={[ChartDataLabels]}
          />
        </ChartErrorBoundary>
      )}
    </div>
  );
}
