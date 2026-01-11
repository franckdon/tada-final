import React, { useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Moon, Sun } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { cloneDeep } from "lodash";
import { useTheme } from "next-themes";
import ChartErrorBoundary from "./chart-error-boundary";
import { tooltipPlugin } from "./chart-tooltip";
import { chartColors } from "@/constants/chart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DataLabelsPluginOptions {
  color: string;
  font: {
    weight: string;
    size: number;
    family: string;
  };
  padding: number;
  formatter: (value: number | string, context: any) => string;
  display: (context: any) => boolean;
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
  padding: 4,
  formatter: (value: number | string, context: any) => {
    let formattedValue = value;
    try {
      formattedValue = parseFloat(value as string);
    } catch (e) {
      // do nothing
    }

    const hiddens = context.chart._hiddenIndices;
    let total = 0;
    const datapoints = context.dataset.data;
    datapoints.forEach((val: number | string, i: number) => {
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
  display(context: any) {
    const { dataset } = context;
    const count = dataset.data.length;
    const value = dataset.data[context.dataIndex];
    return value > count * 1.5;
  },
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  borderRadius: 4,
};

interface PieChartProps {
  chart: {
    chartData: {
      data: ChartData<"pie">;
      options?: ChartOptions<"pie">;
    };
    dataLabels?: boolean;
  };
  redraw?: boolean;
  redrawComplete?: () => void;
}

function PieChart({
  chart,
  redraw = false,
  redrawComplete = () => {},
}: PieChartProps) {
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

  const _getChartOptions = (): ChartOptions<"pie"> | undefined => {
    if (chart.chartData?.options) {
      const newOptions = cloneDeep(chart.chartData.options);
      if (newOptions.plugins?.legend?.labels) {
        newOptions.plugins.legend.labels.color =
          theme === "dark" ? "#fff" : "#000";
      }

      // Add tooltip configuration
      newOptions.plugins = {
        ...newOptions.plugins,
        tooltip: {
          ...tooltipPlugin,
          isCategoryChart: true,
        } as any,
      };

      // Add datalabels plugin
      if (newOptions.plugins) {
        newOptions.plugins.datalabels = chart?.dataLabels
          ? {
              ...dataLabelsPlugin,
              font: {
                weight: "bold" as const,
                size: 10,
                family: "Inter",
              },
            }
          : { formatter: () => "" };
      }

      return newOptions;
    }

    return chart.chartData?.options;
  };

  const _getChartData = (): ChartData<"pie"> | null => {
    const data = cloneDeep(chart.chartData.data);
    if (!data) return null;

    // Get number of segments
    const numSegments = data.labels?.length || 0;
    if (numSegments === 0) return data;

    // Ensure backgroundColor array exists and has enough colors
    data.datasets = data.datasets.map(
      (dataset: ChartData<"pie">["datasets"][0]) => {
        // If dataset already has backgroundColor array, use it
        if (dataset.backgroundColor && Array.isArray(dataset.backgroundColor)) {
          return dataset;
        }

        const colors = (
          Object.values(chartColors) as Array<{ hex: string }>
        ).map((c) => c.hex);
        dataset.backgroundColor = Array(numSegments)
          .fill(null)
          .map((_, i) => {
            // If fillColor exists and is not transparent/null for this index, use it
            const existingColor = (dataset as any).fillColor?.[i];
            if (
              existingColor &&
              existingColor !== "transparent" &&
              existingColor !== null
            ) {
              return existingColor;
            }
            // Otherwise use chartColors in order
            return colors[i % colors.length];
          });

        return dataset;
      }
    );

    return data;
  };

  return (
    <div className="h-full">
      {chart.chartData.data && chart.chartData.data.labels && (
        <ChartErrorBoundary>
          <Pie
            data={_getChartData() || { labels: [], datasets: [] }}
            options={_getChartOptions()}
            redraw={redraw}
            plugins={[ChartDataLabels]}
          />
        </ChartErrorBoundary>
      )}
    </div>
  );
}

export default PieChart;
