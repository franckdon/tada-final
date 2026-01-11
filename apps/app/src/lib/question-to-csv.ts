// src/lib/question-to-csv.ts
import type { CsvRow } from "./export-csv";

type AnyRecord = Record<string, any>;

function isLabelValueArray(data: any): data is Array<{ label: string; value: number; percentage?: number }> {
  return Array.isArray(data) && data.every((x) => x && typeof x === "object" && "label" in x && "value" in x);
}

function isPlainObject(v: any): v is AnyRecord {
  return v && typeof v === "object" && !Array.isArray(v);
}

export function questionToCsvRows(question: {
  question: string;
  type?: string;
  chart_type?: string;
  participants_responded?: number;
  data: any;
}): CsvRow[] {
  const base = {
    question: question.question,
    questionType: question.type ?? "",
    chartType: question.chart_type ?? "",
    participants: question.participants_responded ?? "",
  };

  const data = question.data;

  // Cas 1: formats classiques [{label,value}]
  if (isLabelValueArray(data)) {
    return data.map((row) => ({
      ...base,
      label: row.label,
      value: row.value,
      percentage: row.percentage ?? "",
    }));
  }

  // Cas 2: stacked bar/column: array d'objets avec plusieurs clés (category/label + séries)
  if (Array.isArray(data) && data.every(isPlainObject)) {
    return data.map((row) => ({
      ...base,
      ...row,
    }));
  }

  // Cas 3: table/text/comment: array de strings ou d'objets
  if (Array.isArray(data)) {
    return data.map((row) => ({
      ...base,
      value: isPlainObject(row) ? JSON.stringify(row) : String(row),
    }));
  }

  // Fallback
  return [
    {
      ...base,
      value: isPlainObject(data) ? JSON.stringify(data) : String(data ?? ""),
    },
  ];
}
