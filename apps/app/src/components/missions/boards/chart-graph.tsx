"use client";

import { useChartBuilder } from "@/context/chart-builder-context";
import { Vega, VegaLite } from "react-vega";

export function ChartGraph() {
  const { vegaLiteSpec, data: values } = useChartBuilder();

  // Customize the spec to remove horizontal grid lines, set white background, and add different colors for each bar
  const customizedSpec = {
    ...vegaLiteSpec,
    background: "white",
    config: {
      ...((vegaLiteSpec as any)?.config || {}),
      axis: {
        ...((vegaLiteSpec as any)?.config?.axis || {}),
        grid: false, // Remove all grid lines
        gridOpacity: 0, // Alternative way to hide grid lines
      },
      axisY: {
        ...((vegaLiteSpec as any)?.config?.axisY || {}),
        grid: false, // Specifically remove horizontal grid lines
      },
      view: {
        ...((vegaLiteSpec as any)?.config?.view || {}),
        fill: "white", // Ensure the chart area background is white
        stroke: "transparent", // Remove border
      },
    },
  };
  console.log(vegaLiteSpec);

  return (
    <div className="">
      <VegaLite
        data={{
          values,
        }}
        spec={customizedSpec}
        actions={false}
      />
    </div>
  );
}
