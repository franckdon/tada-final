import { useRef } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getWidthBreakpoint } from "@/constants/layout-breakpoints";

interface GrowthData {
  label: string;
  value: number;
  comparison: number;
  status: "positive" | "negative" | "neutral";
}

interface ChartDatasetConfig {
  datasetColor: string;
}

interface ChartData {
  growth?: GrowthData[];
  showGrowth?: boolean;
  timeInterval?: string;
  ChartDatasetConfigs?: ChartDatasetConfig[];
}

interface KpiChartSegmentProps {
  chart: ChartData;
  editMode: boolean;
}

function KpiChartSegment({ chart, editMode }: KpiChartSegmentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="pl-unit-sm pr-unit-sm sm:max-w-full" ref={containerRef}>
      <div className="flex flex-wrap">
        {chart?.growth?.map((c, index) => {
          const widthBreakpoint = getWidthBreakpoint(containerRef);

          if (
            (widthBreakpoint === "xxs" && index > 1) ||
            (editMode && index > 3) ||
            (widthBreakpoint === "xs" && index > 3) ||
            (widthBreakpoint === "sm" && index > 5) ||
            index > 7
          ) {
            return <span key={c.label} />;
          }

          const formattedComparison =
            c.comparison % 1 === 0
              ? Math.abs(Math.round(c.comparison)).toFixed(0)
              : Math.abs(c.comparison).toFixed(2);

          return (
            <div
              key={c.label}
              className="pb-2.5"
              style={{
                marginRight: `${20 - (chart?.growth?.length || 0) * 2}px`,
              }}
            >
              <div className="flex items-center">
                <div className="text-xl text-default-800 font-bold font-tw">
                  {c.value?.toLocaleString()}
                </div>
                <div className="w-2" />
                {chart.showGrowth && (
                  <div className="group relative">
                    <div>
                      <div
                        className={`
                          inline-flex items-center px-2 py-1 rounded-sm text-sm
                          ${
                            c.status === "neutral"
                              ? "bg-default-100"
                              : c.status === "positive"
                              ? "bg-success-100 text-success-700"
                              : "bg-danger-100 text-danger-700"
                          }
                        `}
                      >
                        {c.status === "positive" && (
                          <ArrowUpRight size={14} className="mr-1" />
                        )}
                        {c.status === "negative" && (
                          <ArrowDownRight size={14} className="mr-1" />
                        )}
                        {`${formattedComparison}%`}
                      </div>
                    </div>
                    <div className="invisible group-hover:visible absolute z-10 px-2 py-1 text-sm bg-gray-900 text-white rounded shadow-lg">
                      compared to last {chart.timeInterval}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <span className="text-sm text-default-600">
                  <span
                    style={
                      chart.ChartDatasetConfigs?.[index]?.datasetColor
                        ? {
                            borderBottom: `solid 3px ${chart.ChartDatasetConfigs[index].datasetColor}`,
                          }
                        : undefined
                    }
                  >
                    {c.label}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default KpiChartSegment;
