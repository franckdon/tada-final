// src/lib/chart-filtering.ts
import type { QuestionData } from "@/lib/utils";
import type { VisualizationId } from "@/lib/chart-types";
import type { ChartConfig } from "@/components/missions/boards/graphs/ui/chart";

/**
 * Question enrichie avec l’état de vue (filtre + tri)
 */
export type QuestionWithView = QuestionData & {
  activeFilter?: "standard" | "age" | "gender" | "genre";
  isSorted?: boolean;
};

/**
 * S’assure qu’on a bien une entrée "value" dans le config
 * (utile pour les BarChart* qui utilisent config.value.color)
 */
function ensureValueConfig(base: ChartConfig): ChartConfig {
  if (base && (base as any).value) return base;

  return {
    ...base,
    value: {
      label: "Réponses",
      color: "hsl(var(--chart-1))",
    },
  };
}

/**
 * Transforme un rating agrégé du type:
 *  [{ "6": 1, "7": 0, "8": 1, "9": 1, category: "Évaluation" }]
 * en tableau [{ label, value }]
 */
function ratingRowToSeries(question: QuestionData): Array<{
  label: string;
  value: number;
  percentage?: number;
}> {
  const rows = (question.data as any[]) ?? [];
  const row = rows[0] ?? {};

  const keys =
    question.primaryKeys ??
    Object.keys(row).filter((k) => k !== "category" && k !== "percentage");

  return keys.map((k) => ({
    label: question.config?.[k]?.label ?? String(k),
    value: Number(row[k] ?? 0),
  }));
}

/**
 * Filtre "genre" pour les questions de type rating
 * → retourne 2 barres: moyenne Hommes / Femmes
 */
// src/lib/chart-filtering.ts

function buildGenderRatingSeries(
  question: QuestionWithView
): {
  data: Array<{ label: string; value: number }>;
  config: ChartConfig;
} {
  const raw = question.rawResponses ?? [];

  if (!raw.length) {
    return {
      data: [],
      config: ensureValueConfig({} as ChartConfig),
    };
  }

  // Pour debug, tu peux laisser ça quelques temps
  console.log(
    "[Gender filter] rawResponses sample",
    raw.map((r) => ({
      sex: r.sex,
      sexe: r.sexe,
      answer: r.answer,
    }))
  );

  let maleSum = 0;
  let maleCount = 0;
  let femaleSum = 0;
  let femaleCount = 0;

  for (const r of raw) {
    // On ne regarde plus r.gender, uniquement sex / sexe
    const genderRaw = (r.sex ?? r.sexe ?? "").toString().toLowerCase();
    const answer = Number(r.answer ?? r.value ?? r.rating);

    if (Number.isNaN(answer)) continue;

    if (genderRaw === "male" || genderRaw === "homme") {
      maleSum += answer;
      maleCount++;
    } else if (genderRaw === "female" || genderRaw === "femme") {
      femaleSum += answer;
      femaleCount++;
    }
  }

  const data: Array<{ label: string; value: number }> = [];

  if (maleCount > 0) {
    data.push({
      label: "Hommes",
      value: Math.round((maleSum / maleCount) * 100) / 100,
    });
  }

  if (femaleCount > 0) {
    data.push({
      label: "Femmes",
      value: Math.round((femaleSum / femaleCount) * 100) / 100,
    });
  }

  const config: ChartConfig = {
    Hommes: {
      label: "Hommes",
      color: "hsl(var(--chart-1))",
    },
    Femmes: {
      label: "Femmes",
      color: "hsl(var(--chart-2))",
    },
  };

  return {
    data,
    config: ensureValueConfig(config),
  };
}

// Tranches d'âge utilisées pour l'agrégation
const AGE_RANGES = [
  "14-17",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65-99",
];

function findAgeRangeForValue(ageRaw: unknown): string | null {
  const age = Number(ageRaw);
  if (Number.isNaN(age)) return null;

  for (const range of AGE_RANGES) {
    const [minStr, maxStr] = range.split("-");
    const min = Number(minStr);
    const max = Number(maxStr);

    if (age >= min && age <= max) {
      return range;
    }
  }

  return null;
}

/**
 * Filtre "âge" pour les questions de type rating
 * → retourne des barres: moyenne par tranche d’âge (14-17, 18-24, etc.)
 */
function buildAgeRatingSeries(
  question: QuestionWithView
): {
  data: Array<{ label: string; value: number }>;
  config: ChartConfig;
} {
  const raw = question.rawResponses ?? [];

  if (!raw.length) {
    return {
      data: [],
      config: ensureValueConfig({} as ChartConfig),
    };
  }

  // Pour chaque tranche d'âge, on accumule sum / count
  const buckets: Record<
    string,
    {
      sum: number;
      count: number;
    }
  > = {};

  for (const range of AGE_RANGES) {
    buckets[range] = { sum: 0, count: 0 };
  }

  for (const r of raw) {
    // suivant ton backend, ça peut être r.age ou r.ageYears, etc.
    const range = findAgeRangeForValue(r.age);
    if (!range) continue;

    const answer = Number(r.answer ?? r.value ?? r.rating);
    if (Number.isNaN(answer)) continue;

    buckets[range].sum += answer;
    buckets[range].count += 1;
  }

  const data: Array<{ label: string; value: number }> = [];

  for (const range of AGE_RANGES) {
    const { sum, count } = buckets[range];
    if (count > 0) {
      data.push({
        label: `${range} ans`,
        value: Math.round((sum / count) * 100) / 100,
      });
    }
  }

  // Config couleur par tranche
  const config: ChartConfig = {};
  data.forEach((item, index) => {
    config[item.label] = {
      label: item.label,
      color: `hsl(var(--chart-${(index % 10) + 1}))`,
    };
  });

  return {
    data,
    config: ensureValueConfig(config),
  };
}



export function applyFilterAndSort(
  question: QuestionWithView,
  vizType: VisualizationId
): {
  data: Array<{ label: string; value: number; percentage?: number }>;
  config: ChartConfig;
} {
  const filter = question.activeFilter ?? "standard";
  const isSorted = question.isSorted ?? false;

  // On ne traite ici que bar/column
  if (vizType !== "bar" && vizType !== "column") {
    return {
      data: (question.data as any[]) ?? [],
      config: ensureValueConfig(question.config as ChartConfig),
    };
  }

  const isGenderFilter = filter === "gender" || filter === "genre";
  const isAgeFilter = filter === "age";

  // 🔹 Cas 1 : rating + filtre GENRE → moyenne par genre
  if (question.type === "rating" && isGenderFilter) {
    const { data, config } = buildGenderRatingSeries(question);
    return {
      data: applySorting(data, isSorted),
      config,
    };
  }

  // 🔹 Cas 2 : rating + filtre AGE → moyenne par tranche d'âge
  if (question.type === "rating" && isAgeFilter) {
    const { data, config } = buildAgeRatingSeries(question);
    return {
      data: applySorting(data, isSorted),
      config,
    };
  }

  // 🔹 Cas 3 : rating standard → explode la row en { label, value }
  let baseData: Array<{ label: string; value: number; percentage?: number }>;

  if (question.type === "rating") {
    baseData = ratingRowToSeries(question);
  } else {
    baseData = ((question.data as any[]) ?? []).map((d) => ({
      label: d.label,
      value: Number(d.value ?? 0),
      percentage: d.percentage,
    }));
  }

  const sorted = applySorting(baseData, isSorted);
  const config = ensureValueConfig(question.config as ChartConfig);

  return {
    data: sorted,
    config,
  };
}



/**
 * Tri décroissant sur value si isSorted = true
 */
function applySorting<T extends { value?: number }>(
  data: T[],
  isSorted: boolean | undefined
): T[] {
  if (!isSorted) return data;
  return [...data].sort(
    (a, b) => (b.value ?? 0) - (a.value ?? 0) // décroissant
  );
}