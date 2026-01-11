"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

type AiAnalysisChart = {
  id: string;
  type: string;
  subType?: string | null;
  title?: string | null;
  description?: string | null;
  chartData: any;
  config?: any;
};

type AiChartProps = {
  chart: AiAnalysisChart;
};

// Palette simple pour différencier les séries / sections pie
const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#ec4899",
  "#0ea5e9",
  "#22c55e",
  "#eab308",
  "#a855f7",
];

function buildCartesianData(chartData: any) {
  const labels: string[] = chartData?.labels ?? [];
  const datasets: { label: string; data: number[] }[] =
    chartData?.datasets ?? [];

  if (!labels.length || !datasets.length) return { data: [], seriesKeys: [] };

  const data = labels.map((label, idx) => {
    const row: Record<string, any> = { label };
    datasets.forEach((ds) => {
      row[ds.label] = ds.data[idx] ?? 0;
    });
    return row;
  });

  const seriesKeys = datasets.map((ds) => ds.label);

  return { data, seriesKeys, labels };
}

export function AiChart({ chart }: AiChartProps) {
  // ================= KPI =================
  if (chart.type === "kpi") {
    const value = chart.chartData?.value ?? 0;
    const label = chart.chartData?.label ?? "Valeur";

    return (
      <div className="flex h-full flex-col justify-between rounded-xl border bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            KPI
          </span>
          {/* Badge soft */}
          <span className="text-[11px] text-slate-400">Dashboard IA</span>
        </div>

        <div className="mt-2">
          <div className="text-xs text-slate-500">{label}</div>
          <div className="mt-1 text-3xl font-semibold tabular-nums">
            {value}
          </div>
        </div>

        {/* Ligne de “trend” fictive (tu pourras brancher un vrai % plus tard) */}
        {/* <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-600">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>+12% vs période précédente</span>
        </div> */}
      </div>
    );
  }

  // ================= CARTESIEN (bar / line) =================
  if (chart.type === "bar" || chart.type === "line") {
    const { data, seriesKeys, labels } = buildCartesianData(chart.chartData);
    if (!data.length || !seriesKeys.length) {
      return (
        <div className="text-[11px] text-muted-foreground">
          Données insuffisantes pour afficher ce graphique.
        </div>
      );
    }

    const isGrouped = chart.subType === "grouped_bar";

    // Gestion des labels longs / nombreux
    const maxLabelLength = labels.reduce(
      (max, l) => Math.max(max, String(l).length),
      0
    );
    const shouldRotateLabels = labels.length > 6 || maxLabelLength > 12;

    const xAxisProps = shouldRotateLabels
      ? {
          angle: -30 as const,
          textAnchor: "end" as const,
          height: 60,
          interval: 0,
        }
      : {
          angle: 0,
          textAnchor: "middle" as const,
          height: 30,
          interval: 0,
        };

    // ==== BAR CHART ====
    if (chart.type === "bar") {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 16 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" {...xAxisProps} />
            <YAxis />
            <Tooltip />
            {isGrouped && <Legend />}
            {!isGrouped && (
              <Bar dataKey={seriesKeys[0]} radius={[4, 4, 0, 0]}>
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[0]} />
                ))}
              </Bar>
            )}
            {isGrouped &&
              seriesKeys.map((key, seriesIdx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  radius={[4, 4, 0, 0]}
                  stackId={
                    chart.subType === "stacked_bar" ? "stack" : undefined
                  }
                >
                  {data.map((_, idx) => (
                    <Cell
                      key={`${key}-${idx}`}
                      fill={COLORS[seriesIdx % COLORS.length]}
                    />
                  ))}
                </Bar>
              ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // ==== LINE CHART ====
    if (chart.type === "line") {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 16 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" {...xAxisProps} />
            <YAxis />
            <Tooltip />
            {seriesKeys.length > 1 && <Legend />}
            {seriesKeys.map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }
  }

  // ================= PIE CHART =================
  if (chart.type === "pie") {
    // On suppose qu’on récupère le même format { labels, datasets }, on utilise la 1ère série
    const labels: string[] = chart.chartData?.labels ?? [];
    const datasets: { label: string; data: number[] }[] =
      chart.chartData?.datasets ?? [];

    if (!labels.length || !datasets.length) {
      return (
        <div className="text-[11px] text-muted-foreground">
          Données insuffisantes pour afficher ce graphique.
        </div>
      );
    }

    const firstDs = datasets[0];
    const data = labels.map((label, idx) => ({
      name: label,
      value: firstDs.data[idx] ?? 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Tooltip />
          <Legend />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={80}
            innerRadius={30}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // ================= FALLBACK =================
  return (
    <pre className="mt-auto max-h-40 overflow-auto rounded bg-muted/40 p-2 text-[10px]">
      {JSON.stringify(chart.chartData, null, 2)}
    </pre>
  );
}
