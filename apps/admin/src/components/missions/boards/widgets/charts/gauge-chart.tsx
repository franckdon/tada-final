import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";
import { semanticColors } from "@heroui/react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  ChartData,
  ChartOptions,
} from "chart.js";
import { cloneDeep } from "lodash";
import ChartDataLabels from "chartjs-plugin-datalabels";
import ChartErrorBoundary from "./chart-error-boundary";
import { useTheme } from "next-themes";
import { chartColors } from "@/constants/chart";
import { tooltipPlugin } from "./chart-tooltip";

ChartJS.register(ArcElement, Tooltip, ChartDataLabels);

interface Range {
  min: number;
  max: number;
  label?: string;
  color?: string;
}

interface ChartDataConfig {
  data: ChartData<"doughnut">;
  options?: ChartOptions<"doughnut">;
}

interface ChartConfig {
  chartData: ChartDataConfig;
  displayLegend?: boolean;
  dataLabels?: boolean;
  ranges?: Range[];
}

interface GaugeChartProps {
  chart: ChartConfig;
  redraw?: boolean;
  redrawComplete?: () => void;
}

interface DataLabelsContext {
  chart: {
    getDatasetMeta: (index: number) => {
      data: Array<{
        startAngle: number;
        endAngle: number;
      }>;
    };
  };
  datasetIndex: number;
  dataIndex: number;
}

export function GaugeChart({
  chart,
  redraw = false,
  redrawComplete = () => {},
}: GaugeChartProps) {
  const { theme } = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);
  const resizeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (redraw) {
      setTimeout(() => {
        redrawComplete();
      }, 1000);
    }
  }, [redraw, redrawComplete]);

  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current);
      }

      resizeTimeout.current = setTimeout(() => {
        if (containerRef.current) {
          setIsCompact(containerRef.current.offsetHeight < 200);
        }
      }, 100);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current);
      }
    };
  }, []);

  const _prepareData = () => {
    if (!chart.chartData?.data?.datasets?.[0]?.data) return null;

    const rawValue =
      chart.chartData.data.datasets[0].data[
        chart.chartData.data.datasets[0].data.length - 1
      ];
    const value =
      typeof rawValue === "string"
        ? parseFloat((rawValue as string).replace(/[^0-9.-]/g, ""))
        : rawValue;

    const ranges = chart.ranges || [{ min: 0, max: 100, label: "Total" }];
    const maxValue = Math.max(...ranges.map((r) => r.max));
    const minValue = Math.min(...ranges.map((r) => r.min));

    // Calculate the percentage for each range
    const rangeData = ranges.map((range) => {
      const rangeSize = range.max - range.min;
      return (rangeSize / maxValue) * 100;
    });

    // Get default colors array for initial setup
    const defaultColors = Object.values(chartColors).map((c) => c.hex);

    // Calculate rotation to point to current value
    const clampedValue = Math.min(
      Math.max(value as number, minValue),
      maxValue
    );
    const valuePercentage =
      ((clampedValue - minValue) / (maxValue - minValue)) * 270 - 135;

    return {
      datasets: [
        {
          data: rangeData,
          backgroundColor: ranges.map(
            (range, index) =>
              range.color || defaultColors[index % defaultColors.length]
          ),
          borderWidth: 0,
          circumference: 270,
          rotation: -135,
        },
        {
          // This dataset creates the pointer
          data: [6, 98], // Small segment for the pointer
          backgroundColor: [
            (
              semanticColors[theme as keyof typeof semanticColors]
                ?.foreground as any
            )?.DEFAULT,
            "transparent",
          ],
          borderWidth: 0,
          circumference: 90,
          rotation: valuePercentage,
        },
      ],
      labels: ranges.map((range) => range.label || `${range.min}-${range.max}`),
    };
  };

  const _getChartOptions = () => {
    const baseOptions = cloneDeep(chart.chartData?.options || {});
    return {
      ...baseOptions,
      responsive: true,
      maintainAspectRatio: isCompact,
      animation: {
        onComplete: function (this: ChartJS, animation: { initial: boolean }) {
          // Only run once by checking if animation is the first one
          if (animation.initial) {
            // Force a dataset update to recalculate label rotations
            this.update();
          }
        },
      },
      plugins: {
        tooltip: {
          ...tooltipPlugin,
          isCategoryChart: true,
          enabled: false,
          external: function (context: any) {
            // Don't show tooltip if hovering over the indicator dataset
            if (context.tooltip?.dataPoints?.[0]?.datasetIndex === 1) {
              return;
            }
            tooltipPlugin.external(context);
          },
          callbacks: {
            title: () => "",
            label: (context: any) => {
              // Only show tooltip for the first dataset (the ranges)
              if (context.datasetIndex === 0) {
                const range = chart.ranges?.[context.dataIndex];
                if (range) {
                  return `${range.label || ""}: ${range.min} - ${range.max}`;
                }
              }
              return "";
            },
          },
        },
        legend: {
          display: isCompact ? false : !!chart.displayLegend,
          position: "top",
        },
        datalabels: {
          display: (context: any) => {
            return chart.dataLabels && !isCompact && context.datasetIndex === 0;
          },
          color: "#fff",
          font: {
            weight: "bold",
            size: 10,
            family: "Inter",
          },
          formatter: (value: number, context: DataLabelsContext) => {
            if (context.datasetIndex === 0 && chart.ranges) {
              const range = chart.ranges?.[context.dataIndex];
              return `${range?.label || `${range?.min}-${range?.max}`}`;
            }
            return "";
          },
          anchor: "center",
          align: "center",
          offset: 0,
          padding: 4,
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          borderRadius: 4,
          rotation: (context: DataLabelsContext) => {
            // Calculate angle based on the segment's midpoint
            const chart = context.chart;
            const meta = chart.getDatasetMeta(context.datasetIndex);
            if (meta.data) {
              const arc = meta.data?.[context.dataIndex];
              if (!arc) return 0;
              const startAngle = arc.startAngle + Math.PI / 2; // Add PI/2 to account for chart rotation
              const endAngle = arc.endAngle + Math.PI / 2;
              const angle = (startAngle + endAngle) / 2;

              // Convert radians to degrees and adjust to keep text readable
              const degrees = (angle * 180) / Math.PI;
              return degrees > 90 && degrees < 270 ? degrees - 180 : degrees;
            }
            return 0;
          },
        },
      },
      scales: {}, // Add empty scales object to disable all axes
      layout: {},
      cutout: "55%",
      events: ["mousemove", "mouseout", "click", "touchstart", "touchmove"], // ensure all events are captured
    };
  };

  // Cleanup tooltip
  useEffect(() => {
    return () => {
      const tooltipEl = document.getElementById("chartjs-tooltip");
      if (tooltipEl) {
        tooltipEl.remove();
      }
    };
  }, []);

  const gaugeData = _prepareData();

  const value =
    chart?.chartData?.data?.datasets?.[0]?.data?.[
      chart?.chartData?.data?.datasets?.[0]?.data?.length - 1
    ];
  const label = chart?.chartData?.data?.datasets?.[0]?.label || "";

  return (
    <div
      ref={containerRef}
      className="h-full relative w-full flex flex-col items-center justify-center"
    >
      {!isCompact && (
        <div className="w-full max-w-[600px] mx-auto h-full">
          <ChartErrorBoundary>
            <Doughnut
              data={gaugeData!}
              options={_getChartOptions() as any}
              redraw={redraw}
            />
            <div className="absolute top-1/2 left-0 right-0 text-center">
              <div className="text-3xl font-bold text-default-800 font-tw">
                {value?.toLocaleString()}
              </div>
              <div className="text-sm text-default-500">{label}</div>
            </div>
          </ChartErrorBoundary>
        </div>
      )}

      {isCompact && (
        <div className="w-full h-full flex flex-row items-center justify-center mx-auto gap-4">
          <div className="flex flex-col items-start justify-center">
            <div className="text-3xl font-bold text-default-800 font-tw">
              {value?.toLocaleString()}
            </div>
            <div className="text-sm text-default-500">{label}</div>
          </div>

          <div className="h-full max-w-[100px] flex items-center justify-center">
            <ChartErrorBoundary>
              <Doughnut
                data={gaugeData!}
                options={_getChartOptions() as any}
                redraw={redraw}
              />
            </ChartErrorBoundary>
          </div>
        </div>
      )}
    </div>
  );
}
