"use client";

import {
  ChartConfig,
  ChartType,
  generateVegaLiteSpec,
} from "@/lib/chart-builder-utils";
import { Input } from "@tada/ui/components/input";
import { TwitterPicker } from "react-color";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { useEffect, useState } from "react";
import { Submission, useChartBuilder } from "@/context/chart-builder-context";
import { Button } from "@tada/ui/components/button";

export default function ChartBuilder() {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [config, setConfig] = useState<ChartConfig>({
    xField: "category",
    yField: "value",
    colorField: "",
    yAggregation: "none", // 'none', 'sum', 'mean', 'count', 'median', 'min', 'max'
    title: "",
    width: 400,
    height: 300,
    color: "#4f46e5",
  });
  const { vegaLiteSpec, setVegaLiteSpec, initialData, data } =
    useChartBuilder();

  const chartTypes = [
    {
      category: "Graphiques de Base",
      charts: [
        { value: "bar", label: "Barres", icon: "📊" },
        { value: "line", label: "Ligne", icon: "📈" },
        { value: "scatter", label: "Nuage de points", icon: "⚬" },
        { value: "area", label: "Aire", icon: "🏔️" },
        { value: "histogram", label: "Histogramme", icon: "📋" },
      ],
    },
    {
      category: "Graphiques Circulaires",
      charts: [
        { value: "pie", label: "Secteurs", icon: "🥧" },
        { value: "donut", label: "Anneau", icon: "🍩" },
        { value: "radial", label: "Radial", icon: "🎯" },
        { value: "polar", label: "Polaire", icon: "🌟" },
      ],
    },
    {
      category: "Cartes",
      charts: [
        { value: "choropleth", label: "Choroplèthe", icon: "🗺️" },
        { value: "point_map", label: "Points sur carte", icon: "📍" },
        {
          value: "point_map_ivory_coast",
          label: "Points sur carte Côte d'Ivoire",
          icon: "🇨🇮",
        },
        { value: "heatmap", label: "Carte de chaleur", icon: "🔥" },
      ],
    },
    {
      category: "Graphiques Interactifs",
      charts: [
        { value: "brush_scatter", label: "Scatter avec sélection", icon: "🖱️" },
        { value: "linked_charts", label: "Graphiques liés", icon: "🔗" },
        { value: "tooltip_chart", label: "Avec infobulles", icon: "💬" },
        { value: "zoom_chart", label: "Avec zoom", icon: "🔍" },
      ],
    },
    {
      category: "Graphiques Avancés",
      charts: [
        { value: "boxplot", label: "Boîte à moustaches", icon: "📦" },
        { value: "violin", label: "Violon", icon: "🎻" },
        { value: "waterfall", label: "Cascade", icon: "🌊" },
        { value: "treemap", label: "Treemap", icon: "🌳" },
        { value: "sunburst", label: "Rayons de soleil", icon: "☀️" },
      ],
    },
  ];

  const handleConfigChange = (
    key: keyof ChartConfig,
    value: string | number
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    setVegaLiteSpec(generateVegaLiteSpec(config, chartType, data));
  }, [chartType, config]);

  const dataFields =
    initialData.length > 0 ? Object.keys(initialData[0] as Submission) : [];

  return (
    <div className="bg-white dark:bg-slate-600 rounded-lg mx-auto p-4 w-full border">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-semibold">Chart Settings</h3>
      </div>

      <hr className="my-4" />
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type de graphique
          </label>
          <Select
            onValueChange={(value) => setChartType(value as ChartType)}
            defaultValue={chartType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a chart type" />
            </SelectTrigger>
            <SelectContent>
              {chartTypes.map((category) => (
                <SelectGroup key={category.category}>
                  {category.charts.map((chart) => (
                    <SelectItem key={chart.value} value={chart.value}>
                      {chart.icon} {chart.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Configuration des axes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Axe X / Catégorie
            </label>

            <Select
              onValueChange={(value) =>
                handleConfigChange("xField", value === "none" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune valeur</SelectItem>
                {dataFields.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Axe Y / Valeur
            </label>

            <Select
              onValueChange={(value) =>
                handleConfigChange("yField", value === "none" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune valeur</SelectItem>
                {dataFields.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agrégation
          </label>
          <Select
            onValueChange={(value) =>
              handleConfigChange(
                "yAggregation",
                value as
                  | "none"
                  | "sum"
                  | "mean"
                  | "count"
                  | "median"
                  | "min"
                  | "max"
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucune valeur</SelectItem>
              <SelectItem value="sum">Somme</SelectItem>
              <SelectItem value="mean">Moyenne</SelectItem>
              <SelectItem value="count">Nombre</SelectItem>
              <SelectItem value="median">Médiane</SelectItem>
              <SelectItem value="min">Minimum</SelectItem>
              <SelectItem value="max">Maximum</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Groupement par couleur (optionnel)
          </label>
          <Select
            onValueChange={(value) =>
              handleConfigChange("colorField", value === "none" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucune valeur</SelectItem>
              {dataFields.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Légende
          </label>
          <Input
            type="text"
            value={config.title}
            onChange={(e) => handleConfigChange("title", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Couleur par défaut
          </label>

          <TwitterPicker
            triangle={"hide"}
            color={config.color}
            onChangeComplete={(color) => handleConfigChange("color", color.hex)}
          />
        </div>
        <div>
          <Button>Ajouter au board</Button>
        </div>
      </div>
    </div>
  );
}
