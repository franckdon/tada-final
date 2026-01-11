export interface ChartConfig {
  xField: string;
  yField: string;
  yAggregation: "none" | "sum" | "mean" | "count" | "median" | "min" | "max";
  colorField: string;
  title: string;
  width: number;
  height: number;
  color: string;
}
export type ChartType =
  | "bar"
  | "line"
  | "scatter"
  | "area"
  | "histogram"
  | "pie"
  | "donut"
  | "radial"
  | "polar"
  | "choropleth"
  | "point_map"
  | "point_map_ivory_coast"
  | "heatmap"
  | "brush_scatter"
  | "linked_charts"
  | "tooltip_chart"
  | "zoom_chart"
  | "boxplot"
  | "violin"
  | "waterfall"
  | "treemap"
  | "sunburst";

export const generateVegaLiteSpec = <T>(
  config: ChartConfig,
  chartType: ChartType,
  data: T[]
) => {
  const baseSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: config.title,
    width: config.width,
    height: config.height,
    data: { values: data },
  };

  const generateDefaultTooltips = (additionalFields: string[] = []) => {
    const allFields = [
      ...new Set([
        config.xField,
        config.yField,
        config.colorField,
        ...additionalFields,
      ]),
    ].filter(Boolean);
    return allFields.map((field) => ({
      field: field,
      type:
        typeof (data[0] as Record<string, unknown>)?.[field] === "number"
          ? "quantitative"
          : "nominal",
      title: field.charAt(0).toUpperCase() + field.slice(1),
    }));
  };
  const getYEncoding = () => {
    if (config.yAggregation === "none") {
      return {
        field: config.yField,
        type: "quantitative",
        axis: { title: config.yField },
      };
    } else if (config.yAggregation === "count") {
      return {
        aggregate: "count",
        type: "quantitative",
        axis: { title: `Nombre d'éléments` },
      };
    } else {
      return {
        field: config.yField,
        type: "quantitative",
        aggregate: config.yAggregation,
        axis: { title: `${config.yAggregation}(${config.yField})` },
      };
    }
  };
  const yEncoding = getYEncoding();

  switch (chartType) {
    case "bar":
      return {
        ...baseSpec,
        mark: { type: "bar", color: config.color },
        encoding: {
          x: {
            field: config.xField,
            type: "nominal",
            axis: { title: config.xField },
          },
          y: yEncoding,

          ...(config.colorField && {
            color: {
              field: config.colorField,
              type: "nominal",
            },
          }),
          tooltip: generateDefaultTooltips(),
        },
      };

    case "line":
      return {
        ...baseSpec,
        mark: { type: "line", point: true, color: config.color },
        encoding: {
          x: {
            field: config.xField,
            type: "ordinal",
            axis: { title: config.xField },
          },
          y: yEncoding,
          ...(config.colorField && {
            color: {
              field: config.colorField,
              type: "nominal",
            },
          }),
          tooltip: generateDefaultTooltips(),
        },
      };

    case "scatter":
      return {
        ...baseSpec,
        mark: { type: "circle", size: 100, color: config.color },
        encoding: {
          x: {
            field: config.xField,
            type: "quantitative",
            axis: { title: config.xField },
          },
          y: yEncoding,
          ...(config.colorField && {
            color: {
              field: config.colorField,
              type: "nominal",
            },
          }),
          tooltip: generateDefaultTooltips(),
        },
      };

    case "area":
      return {
        ...baseSpec,
        mark: { type: "area", color: config.color, opacity: 0.7 },
        encoding: {
          x: {
            field: config.xField,
            type: "ordinal",
            axis: { title: config.xField },
          },
          y: yEncoding,
          ...(config.colorField && {
            color: {
              field: config.colorField,
              type: "nominal",
            },
          }),
          tooltip: generateDefaultTooltips(),
        },
      };

    case "pie":
      const pieYEncoding =
        config.yAggregation === "none"
          ? { field: config.yField, type: "quantitative" }
          : {
              field: config.yField,
              type: "quantitative",
              aggregate:
                config.yAggregation === "count" ? "count" : config.yAggregation,
            };

      return {
        ...baseSpec,
        mark: { type: "arc", innerRadius: 0 },
        encoding: {
          theta: pieYEncoding,
          color: {
            field: config.colorField,
            type: "nominal",
          },
          tooltip: [
            { field: config.xField, type: "nominal", title: config.xField },
            {
              field: config.yField,
              type: "quantitative",
              title: config.yField,
            },
            {
              field: config.yField,
              type: "quantitative",
              title: "Pourcentage",
              format: ".1%",
            },
          ],
        },
      };

    case "donut":
      const donutYEncoding =
        config.yAggregation === "none"
          ? { field: config.yField, type: "quantitative" }
          : {
              field: config.yField,
              type: "quantitative",
              aggregate:
                config.yAggregation === "count" ? "count" : config.yAggregation,
            };

      return {
        ...baseSpec,
        mark: { type: "arc", innerRadius: 60, outerRadius: 120 },
        encoding: {
          theta: donutYEncoding,
          color: {
            field: config.colorField,
            type: "nominal",
          },
          tooltip: [
            { field: config.xField, type: "nominal", title: config.xField },
            {
              field: config.yField,
              type: "quantitative",
              title: config.yField,
            },
            {
              field: config.yField,
              type: "quantitative",
              title: "Pourcentage",
              format: ".1%",
            },
          ],
        },
      };

    case "radial":
      const radialYEncoding =
        config.yAggregation === "none"
          ? {
              field: config.yField,
              type: "quantitative",
              scale: { range: [30, 100] },
            }
          : {
              field: config.yField,
              type: "quantitative",
              aggregate:
                config.yAggregation === "count" ? "count" : config.yAggregation,
              scale: { range: [30, 100] },
            };

      return {
        ...baseSpec,
        mark: { type: "arc", innerRadius: 30, outerRadius: 100 },
        encoding: {
          theta: radialYEncoding,
          radius: radialYEncoding,
          color: { field: config.xField, type: "nominal" },
          tooltip: generateDefaultTooltips(),
        },
      };

    case "polar":
      return {
        ...baseSpec,
        mark: { type: "point", size: 100 },
        transform: [
          {
            calculate:
              "datum['" +
              config.yField +
              "'] * cos(2 * PI * datum['" +
              config.xField +
              "'] / 10)",
            as: "x_coord",
          },
          {
            calculate:
              "datum['" +
              config.yField +
              "'] * sin(2 * PI * datum['" +
              config.xField +
              "'] / 10)",
            as: "y_coord",
          },
        ],
        encoding: {
          x: { field: "x_coord", type: "quantitative", axis: { title: "X" } },
          y: { field: "y_coord", type: "quantitative", axis: { title: "Y" } },
          color: { field: config.colorField || config.xField, type: "nominal" },
          tooltip: generateDefaultTooltips(["x_coord", "y_coord"]),
        },
      };

    case "histogram":
      return {
        ...baseSpec,
        mark: { type: "bar", color: config.color },
        encoding: {
          x: {
            field: config.xField,
            type: "quantitative",
            bin: true,
            axis: { title: config.xField },
          },
          y: {
            aggregate: "count",
            type: "quantitative",
            axis: { title: "Fréquence" },
          },
          tooltip: [
            {
              field: config.xField,
              type: "quantitative",
              bin: true,
              title: "Plage",
            },
            { aggregate: "count", type: "quantitative", title: "Fréquence" },
          ],
        },
      };

    case "choropleth":
      return {
        ...baseSpec,
        data: {
          url: "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
          format: { type: "json", property: "features" },
        },
        mark: { type: "geoshape", stroke: "white", strokeWidth: 0.5 },
        encoding: {
          color: {
            field: "properties.NAME",
            type: "nominal",
            scale: { scheme: "category20" },
          },
          tooltip: { field: "properties.NAME", type: "nominal", title: "Pays" },
        },
        projection: { type: "naturalEarth1" },
      };

    case "point_map":
      return {
        ...baseSpec,
        layer: [
          {
            data: {
              url: "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
              format: { type: "json", property: "features" },
            },
            mark: { type: "geoshape", fill: "lightgray", stroke: "white" },
            projection: { type: "naturalEarth1" },
          },
          {
            data: { values: data },
            mark: {
              type: "circle",
              size: 100,
              opacity: 0.8,
              color: config.color,
            },
            encoding: {
              longitude: { field: "longitude", type: "quantitative" },
              latitude: { field: "latitude", type: "quantitative" },
              size:
                config.yAggregation === "none"
                  ? {
                      field: config.yField,
                      type: "quantitative",
                      scale: { range: [50, 300] },
                    }
                  : {
                      field: config.yField,
                      type: "quantitative",
                      aggregate:
                        config.yAggregation === "count"
                          ? "count"
                          : config.yAggregation,
                      scale: { range: [50, 300] },
                    },
              color: {
                field: config.colorField || config.xField,
                type: "nominal",
              },
              tooltip: [
                { field: config.xField, type: "nominal" },
                { field: config.yField, type: "quantitative" },
              ],
            },
          },
        ],
        projection: { type: "naturalEarth1" },
      };

    case "point_map_ivory_coast":
      return {
        ...baseSpec,
        layer: [
          // Couche 1: La carte de la Côte d'Ivoire
          {
            data: {
              url: "https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/ivory%20coast.geojson",
              format: { type: "json", property: "features" },
            },
            mark: {
              type: "geoshape",
              fill: "#f0f0f0",
              stroke: "#333333",
              strokeWidth: 1.5,
            },
          },

          // Couche 2: Les points de données
          {
            data: { values: data },
            mark: {
              type: "circle",
              size: 120,
              opacity: 0.8,
              color: config.color,
              stroke: "white",
              strokeWidth: 1,
            },
            encoding: {
              longitude: {
                field: "longitude",
                type: "quantitative",
              },
              latitude: {
                field: "latitude",
                type: "quantitative",
              },
              size: {
                field: config.yField,
                type: "quantitative",
                scale: { range: [80, 400] },
              },
              color: {
                field: config.colorField || config.xField,
                type: "nominal",
              },
              tooltip: generateDefaultTooltips(["longitude", "latitude"]),
            },
          },
        ],
        projection: {
          type: "mercator",
          center: [-5.5, 7.5],
          scale: 3000,
        },
        resolve: {
          scale: {
            color: "independent",
          },
        },
      };

    case "heatmap":
      return {
        ...baseSpec,
        mark: { type: "rect" },
        encoding: {
          x: { field: config.xField, type: "ordinal" },
          y: { field: config.colorField || "category2", type: "ordinal" },
          color:
            config.yAggregation === "none"
              ? {
                  field: config.yField,
                  type: "quantitative",
                  scale: { scheme: "viridis" },
                }
              : {
                  field: config.yField,
                  type: "quantitative",
                  aggregate:
                    config.yAggregation === "count"
                      ? "count"
                      : config.yAggregation,
                  scale: { scheme: "viridis" },
                },
          tooltip: [
            { field: config.xField, type: "ordinal" },
            { field: config.colorField || "category2", type: "ordinal" },
            { field: config.yField, type: "quantitative" },
          ],
        },
      };

    case "brush_scatter":
      return {
        ...baseSpec,
        mark: { type: "circle", size: 100 },
        params: [
          {
            name: "brush",
            select: { type: "interval" },
          },
        ],
        encoding: {
          x: {
            field: config.xField,
            type: "quantitative",
            axis: { title: config.xField },
          },
          y:
            config.yAggregation === "none"
              ? {
                  field: config.yField,
                  type: "quantitative",
                  axis: { title: config.yField },
                }
              : yEncoding,
          color: {
            condition: {
              param: "brush",
              field: config.colorField || config.xField,
              type: "nominal",
            },
            value: "grey",
          },
          tooltip: generateDefaultTooltips(),
        },
      };

    case "linked_charts":
      return {
        ...baseSpec,
        vconcat: [
          {
            mark: { type: "bar" },
            params: [{ name: "click", select: { type: "point" } }],
            encoding: {
              x: {
                field: config.xField,
                type: "nominal",
                axis: { title: config.xField },
              },
              y: yEncoding,
              color: {
                condition: {
                  param: "click",
                  value: config.color,
                },
                value: "lightgray",
              },
            },
          },
          {
            mark: { type: "circle", size: 100 },
            encoding: {
              x: {
                field: config.xField,
                type: "nominal",
                axis: { title: config.xField },
              },
              y: yEncoding,
              color: {
                condition: {
                  param: "click",
                  field: config.colorField || config.xField,
                  type: "nominal",
                },
                value: "lightgray",
              },
              tooltip: generateDefaultTooltips(),
            },
          },
        ],
      };

    case "tooltip_chart":
      return {
        ...baseSpec,
        mark: { type: "circle", size: 100, tooltip: true },
        encoding: {
          x: { field: config.xField, type: "quantitative" },
          y:
            config.yAggregation === "none"
              ? { field: config.yField, type: "quantitative" }
              : yEncoding,
          color: { field: config.colorField || config.xField, type: "nominal" },
          tooltip: generateDefaultTooltips(),
        },
      };

    case "zoom_chart":
      return {
        ...baseSpec,
        mark: { type: "circle", size: 100 },
        params: [
          {
            name: "zoom",
            select: { type: "interval" },
            bind: "scales",
          },
        ],
        encoding: {
          x: {
            field: config.xField,
            type: "quantitative",
            axis: { title: config.xField },
          },
          y:
            config.yAggregation === "none"
              ? {
                  field: config.yField,
                  type: "quantitative",
                  axis: { title: config.yField },
                }
              : yEncoding,
          color: { field: config.colorField || config.xField, type: "nominal" },
          tooltip: generateDefaultTooltips(),
        },
      };

    case "boxplot":
      return {
        ...baseSpec,
        mark: { type: "boxplot", size: 40 },
        encoding: {
          x: { field: config.xField, type: "nominal" },
          y: { field: config.yField, type: "quantitative" },
          color: { field: config.colorField || config.xField, type: "nominal" },
          tooltip: [
            { field: config.xField, type: "nominal", title: config.xField },
            { field: config.yField, type: "quantitative", title: "Min" },
            { field: config.yField, type: "quantitative", title: "Q1" },
            { field: config.yField, type: "quantitative", title: "Médiane" },
            { field: config.yField, type: "quantitative", title: "Q3" },
            { field: config.yField, type: "quantitative", title: "Max" },
          ],
        },
      };

    case "violin":
      return {
        ...baseSpec,
        transform: [
          {
            density: config.yField,
            bandwidth: 0.3,
            groupby: [config.xField],
            extent: [0, 100],
            as: ["value", "density"],
          },
        ],
        mark: { type: "area", orient: "horizontal" },
        encoding: {
          x: {
            field: "density",
            type: "quantitative",
            axis: { title: "Densité" },
            stack: "center",
          },
          y: {
            field: "value",
            type: "quantitative",
            axis: { title: config.yField },
          },
          color: { field: config.xField, type: "nominal" },
          column: { field: config.xField, type: "nominal" },
        },
      };

    case "waterfall":
      return {
        ...baseSpec,
        data: {
          values: [
            { label: "Begin", amount: 10 },
            { label: "Jan", amount: 3 },
            { label: "Feb", amount: -2 },
            { label: "Mar", amount: 5 },
            { label: "Apr", amount: -3 },
            { label: "End", amount: 0 },
          ],
        },
        transform: [
          { window: [{ op: "sum", field: "amount", as: "sum" }] },
          { window: [{ op: "lead", field: "label", as: "lead" }] },
          {
            calculate: "datum.lead === null ? datum.label : datum.lead",
            as: "lead",
          },
          {
            calculate: "datum.label === 'Begin' ? 0 : datum.sum - datum.amount",
            as: "previous_sum",
          },
          {
            calculate: "datum.label === 'Begin' ? datum.amount : datum.sum",
            as: "amount_end",
          },
          {
            calculate:
              "(datum.label !== 'Begin' && datum.label !== 'End' && datum.amount > 0 ? '+' : '') + datum.amount",
            as: "text_amount",
          },
        ],
        mark: { type: "bar", size: 45 },
        encoding: {
          x: { field: "label", type: "ordinal", axis: { title: "Période" } },
          y: {
            field: "previous_sum",
            type: "quantitative",
            axis: { title: "Valeur" },
          },
          y2: { field: "amount_end", type: "quantitative" },
          color: {
            condition: [
              {
                test: "datum.label === 'Begin' || datum.label === 'End'",
                value: "#f7a35c",
              },
              { test: "datum.amount < 0", value: "#e74c3c" },
            ],
            value: "#1f77b4",
          },
        },
      };

    case "treemap":
      return {
        ...baseSpec,
        data: {
          values: [
            { id: 1, parent: "", value: 100, name: "Root" },
            { id: 2, parent: 1, value: 60, name: "A" },
            { id: 3, parent: 1, value: 40, name: "B" },
            { id: 4, parent: 2, value: 35, name: "A1" },
            { id: 5, parent: 2, value: 25, name: "A2" },
            { id: 6, parent: 3, value: 20, name: "B1" },
            { id: 7, parent: 3, value: 20, name: "B2" },
          ],
        },
        mark: { type: "rect", stroke: "white", strokeWidth: 2 },
        encoding: {
          x: { field: "x0", type: "quantitative", axis: null },
          x2: { field: "x1", type: "quantitative" },
          y: { field: "y0", type: "quantitative", axis: null },
          y2: { field: "y1", type: "quantitative" },
          color: { field: "name", type: "nominal" },
          tooltip: [
            { field: "name", type: "nominal" },
            { field: "value", type: "quantitative" },
          ],
        },
        transform: [
          {
            stratify: { key: "id", parentKey: "parent" },
            hierarchy: { field: "value" },
          },
          {
            treemap: {
              field: "value",
              sort: { field: "value", order: "descending" },
              round: true,
              size: [{ signal: "width" }, { signal: "height" }],
            },
          },
        ],
      };

    case "sunburst":
      return {
        ...baseSpec,
        mark: { type: "arc", innerRadius: 20, stroke: "white", strokeWidth: 1 },
        transform: [
          {
            partition: {
              field: config.yField,
              sort: { field: config.yField, order: "descending" },
              size: [{ signal: "2 * PI" }, { signal: "width / 2" }],
            },
          },
        ],
        encoding: {
          theta: { field: "startAngle", type: "quantitative", scale: null },
          theta2: { field: "endAngle", type: "quantitative", scale: null },
          radius: { field: "innerRadius", type: "quantitative", scale: null },
          radius2: { field: "outerRadius", type: "quantitative", scale: null },
          color: { field: config.colorField || config.xField, type: "nominal" },
        },
      };

    default:
      return baseSpec;
  }
};
