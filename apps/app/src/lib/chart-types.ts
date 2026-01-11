export const ALL_VISUALIZATIONS = [
  { id: "bar",            labelKey: "visualizations.bar" },
  { id: "column",         labelKey: "visualizations.column" },
  { id: "stacked_bar",    labelKey: "visualizations.stacked_bar" },
  { id: "stacked_column", labelKey: "visualizations.stacked_column" },
  { id: "pie",            labelKey: "visualizations.pie" },
  { id: "table",          labelKey: "visualizations.table" },
  { id: "turf",           labelKey: "visualizations.turf" },
] as const;

export type VisualizationId = (typeof ALL_VISUALIZATIONS)[number]["id"];

export function getVisualizationDef(id: VisualizationId) {
  return ALL_VISUALIZATIONS.find((v) => v.id === id)!;
}
