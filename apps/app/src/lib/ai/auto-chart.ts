import { AiDataset, AiAnalysis } from "@prisma/client";
import { prisma } from "@/lib/prisma";


type DetectedSchema = {
  columns: {
    name: string;
    type?: string; // "number" | "string" | "date" ...
    role?: string; // "metric" | "dimension" | "time" ...
  }[];
};

type SampleRow = Record<string, any>;

type GenerateChartsParams = {
  analysis: AiAnalysis;
  dataset: AiDataset;
};

/**
 * Génère quelques charts automatiques à partir du detectedSchema + sampleData
 * et les enregistre dans AiAnalysisChart.
 */
export async function generateAutoChartsForAnalysis({
  analysis,
  dataset,
}: GenerateChartsParams) {
  if (!dataset.detectedSchema) return;
  if (!dataset.sampleData) return;

  let schema: DetectedSchema;
  let sample: SampleRow[];

  try {
    schema =
      typeof dataset.detectedSchema === "string"
        ? (JSON.parse(dataset.detectedSchema) as DetectedSchema)
        : (dataset.detectedSchema as unknown as DetectedSchema);

    sample =
      typeof dataset.sampleData === "string"
        ? (JSON.parse(dataset.sampleData) as SampleRow[])
        : (dataset.sampleData as unknown as SampleRow[]);
  } catch (e) {
    console.warn("[AUTO_CHARTS] Impossible de parser detectedSchema/sampleData", e);
    return;
  }

  if (!schema?.columns?.length || !sample?.length) return;

  // 1) Choisir une dimension (catégorielle) et des métriques (numériques)
  const dimensionCol =
    schema.columns.find((c) => c.role === "dimension") ||
    schema.columns.find((c) => c.type === "string") ||
    schema.columns[0];

  const metricCols =
    schema.columns
      .filter((c) => c.role === "metric" || c.type === "number")
      .slice(0, 2) || [];

  // Si on n’a pas au moins une dimension + une métrique, on ne génère rien
  if (!dimensionCol || !metricCols.length) {
    return;
  }

  // 2) Préparer labels + datasets simples à partir de sampleData
  const labels: string[] = [];
  const datasets: { label: string; data: number[] }[] = metricCols.map(
    (m) => ({
      label: m.name,
      data: [],
    }),
  );

  // On limite le nombre de points à 50 pour le preview
  const maxRows = 50;

  for (let i = 0; i < sample.length && i < maxRows; i++) {
    const row = sample[i];
    const label = String(row[dimensionCol.name] ?? `Row ${i + 1}`);
    labels.push(label);

    metricCols.forEach((m, idx) => {
      const raw = row[m.name];
      const value =
        typeof raw === "number" ? raw : raw != null ? Number(raw) : 0;
      datasets[idx].data.push(Number.isFinite(value) ? value : 0);
    });
  }

  // 3) Chart 1 : Bar chart [dimension vs 1ere métrique]
  const barChartData = {
    labels,
    datasets: [
      {
        label: metricCols[0].name,
        data: datasets[0].data,
      },
    ],
  };

  // 4) Chart 2 : éventuellement une 2ème métrique (multi-séries)
  let multiMetricChartData: any = null;
  if (metricCols.length > 1) {
    multiMetricChartData = {
      labels,
      datasets: datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
      })),
    };
  }

  // 5) KPI : nombre de lignes
  const totalCount = dataset.rowCount ?? sample.length;

  // 6) Création des charts en base
  const chartsData: {
    type: string;
    subType?: string | null;
    title?: string | null;
    description?: string | null;
    chartData: any;
    config?: any;
    layout?: any;
    order?: number | null;
  }[] = [];

  chartsData.push({
    type: "bar",
    subType: "simple_bar",
    title: `Répartition de ${metricCols[0].name} par ${dimensionCol.name}`,
    description: null,
    chartData: barChartData,
    config: {
      xField: dimensionCol.name,
      yField: metricCols[0].name,
      aggregation: "sum",
    },
    layout: null,
    order: 1,
  });

  if (multiMetricChartData) {
    chartsData.push({
      type: "bar",
      subType: "grouped_bar",
      title: `Comparaison des métriques par ${dimensionCol.name}`,
      description: null,
      chartData: multiMetricChartData,
      config: {
        xField: dimensionCol.name,
        yFields: metricCols.map((m) => m.name),
        aggregation: "sum",
      },
      layout: null,
      order: 2,
    });
  }

  chartsData.push({
    type: "kpi",
    subType: null,
    title: "Nombre de lignes",
    description: null,
    chartData: {
      value: totalCount,
      label: "Total de lignes",
    },
    config: {
      metric: "rowCount",
    },
    layout: null,
    order: 0,
  });

  // 7) Enregistrer en base
  await prisma.$transaction(async (tx) => {
    // Optionnel : nettoyer les charts auto-générés existants pour cette analyse
    await tx.aiAnalysisChart.deleteMany({
      where: {
        analysisId: analysis.id,
      },
    });

    let currentOrder = 0;

    for (const c of chartsData) {
      currentOrder++;

      await tx.aiAnalysisChart.create({
        data: {
          analysisId: analysis.id,
          type: c.type,
          subType: c.subType ?? null,
          title: c.title ?? null,
          description: c.description ?? null,
          chartData: c.chartData,
          config: c.config ?? null,
          layout: c.layout ?? null,
          order: c.order ?? currentOrder,
        },
      });
    }
  });
}
