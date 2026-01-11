import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  RadialLinearScale,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from "chart.js";
import { semanticColors } from "@heroui/react";
import { cloneDeep } from "lodash";
import { tooltipPlugin } from "./chart-tooltip";

import ChartErrorBoundary from "./chart-error-boundary";
import { useTheme } from "next-themes";

ChartJS.register(
  CategoryScale,
  RadialLinearScale,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartDataConfig {
  data: ChartData<"radar">;
  options?: ChartOptions<"radar">;
}

interface ChartConfig {
  chartData: ChartDataConfig;
}

interface RadarChartProps {
  chart: ChartConfig;
  redraw?: boolean;
  redrawComplete?: () => void;
}

export function RadarChart({
  chart,
  redraw = false,
  redrawComplete = () => {},
}: RadarChartProps) {
  const { theme } = useTheme();

  useEffect(() => {
    if (redraw) {
      setTimeout(() => {
        redrawComplete();
      }, 1000);
    }
  }, [redraw, redrawComplete]);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      const tooltipEl = document.getElementById("chartjs-tooltip");
      if (tooltipEl) {
        tooltipEl.remove();
      }
    };
  }, []);

  const getChartOptions = () => {
    // add any dynamic changes to the chartJS options here
    if (chart.chartData?.options) {
      const newOptions = cloneDeep(chart.chartData.options);

      if (newOptions.scales) {
        newOptions.scales = {
          r: {
            grid: {
              color: (
                semanticColors[theme as "light" | "dark"]?.content3 as any
              )?.DEFAULT,
            },
            angleLines: {
              color: (
                semanticColors[theme as "light" | "dark"]?.content3 as any
              )?.DEFAULT,
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

      // Add tooltip configuration
      newOptions.plugins = {
        ...newOptions.plugins,
        tooltip: {
          ...tooltipPlugin,
          isCategoryChart: true,
        } as any,
      };

      return newOptions;
    }

    return chart.chartData?.options;
  };

  return (
    <div className="h-full">
      {chart.chartData.data && chart.chartData.data.labels && (
        <ChartErrorBoundary>
          <Radar
            data={chart.chartData.data}
            options={getChartOptions()}
            redraw={redraw}
          />
        </ChartErrorBoundary>
      )}
    </div>
  );
}
