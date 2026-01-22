"use client";

import { useChartBuilder } from "@/context/chart-builder-context";
import { VegaEmbed } from "react-vega";

export function ChartGraph() {
  const { vegaLiteSpec, data: values } = useChartBuilder();

  const customizedSpec = {
    ...vegaLiteSpec,
    // injecte les données directement dans le spec (VegaEmbed v8)
    data: { values },
    background: "white",
    config: {
      ...((vegaLiteSpec as any)?.config || {}),
      axis: {
        ...((vegaLiteSpec as any)?.config?.axis || {}),
        grid: false,
        gridOpacity: 0,
      },
      axisY: {
        ...((vegaLiteSpec as any)?.config?.axisY || {}),
        grid: false,
      },
      view: {
        ...((vegaLiteSpec as any)?.config?.view || {}),
        fill: "white",
        stroke: "transparent",
      },
    },
  };

  return (
    <div>
      <VegaEmbed spec={customizedSpec} options={{ mode: "vega-lite" }} />
    </div>
  );
}
