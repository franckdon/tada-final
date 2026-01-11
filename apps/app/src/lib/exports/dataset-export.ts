// src/lib/exports/dataset-export.ts

import type { QuestionWithView } from "@/lib/chart-filtering";
import type { CodebookRow, ResponseRow } from "./types";

// ---------------------------------------------
// Utils
// ---------------------------------------------

/** Slug stable pour noms de variables */
export const slug = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // accents
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "");

/** Variable name stable */
export const makeVarName = (index: number, questionLabel: string) =>
  `q${index + 1}_${slug(questionLabel).slice(0, 50) || "question"}`;

/** Nettoie une valeur texte pour export */
const safeCell = (v: unknown) => {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "boolean") return v ? 1 : 0;
  return String(v).trim();
};

type OptionItem = { label: string; value?: number; percentage?: number };

/** Tente d'extraire des options depuis q.data (format label/value) */
const extractOptions = (q: QuestionWithView): OptionItem[] => {
  const data: any = (q as any)?.data;

  if (!Array.isArray(data)) return [];

  // cas fréquent: [{label, value}] pour bar/pie/column
  if (data.every((d) => d && typeof d === "object" && "label" in d)) {
    return data.map((d: any) => ({
      label: String(d.label ?? ""),
      value: typeof d.value === "number" ? d.value : undefined,
      percentage: typeof d.percentage === "number" ? d.percentage : undefined,
    }));
  }

  // cas table texte: ["a","b"] ou [{text:""}]
  if (data.every((d) => typeof d === "string")) {
    return data.map((d: string) => ({ label: d }));
  }

  return [];
};

/**
 * Détecte si c'est multi-choix (one-hot) :
 * - soit q.type === "multiple"
 * - soit q.primaryKeys existe (certaines viz stackées)
 */
const isMultiChoice = (q: QuestionWithView) => {
  const t = String((q as any)?.type || "").toLowerCase();
  if (t.includes("multiple")) return true;
  const pk = (q as any)?.primaryKeys;
  return Array.isArray(pk) && pk.length > 0;
};

// ---------------------------------------------
// Codebook
// ---------------------------------------------

export function buildCodebook(questions: QuestionWithView[]): CodebookRow[] {
  return questions.map((q, index) => {
    const variable_name = makeVarName(index, q.question);
    const options = extractOptions(q);

    // Values mapping "1=Option A | 2=Option B"
    const values =
      options.length > 0
        ? options
            .map((opt, i) => `${i + 1}=${String(opt.label).replace(/\|/g, "/")}`)
            .join(" | ")
        : undefined;

    return {
      question_id: q.chartId ?? `Q${index + 1}`,
      variable_name,
      question_label: q.question,
      question_type: String((q as any)?.type ?? "unknown"),
      values,
      base: typeof (q as any)?.participants_responded === "number"
        ? (q as any).participants_responded
        : undefined,
    };
  });
}

// ---------------------------------------------
// Responses (dataset)
// ---------------------------------------------

/**
 * IMPORTANT:
 * - Si tu n'as pas les réponses brutes, on ne peut PAS reconstruire un vrai dataset respondent-level.
 * - Donc ce helper propose 2 modes:
 *   1) "aggregated" (par défaut): 1 ligne par question-option (propre & vrai)
 *   2) "synthetic": génère des répondants “simulés” pour avoir un format 1 ligne = 1 répondant
 *
 * Reco: utilise "aggregated" tant que tu n’as pas de raw responses.
 */

export type DatasetMode = "aggregated" | "synthetic";

export function buildResponsesAggregated(
  questions: QuestionWithView[]
): ResponseRow[] {
  // 1 ligne = 1 option (ou 1 item) d'une question
  const rows: ResponseRow[] = [];

  questions.forEach((q, qi) => {
    const variable = makeVarName(qi, q.question);
    const options = extractOptions(q);

    // si pas d'options, on sort quand même une ligne "empty"
    if (options.length === 0) {
      rows.push({
        respondent_id: `${q.chartId ?? `Q${qi + 1}`}`,
        question_id: safeCell(q.chartId ?? `Q${qi + 1}`) as any,
        question_label: safeCell(q.question) as any,
        variable_name: safeCell(variable) as any,
        option_code: null,
        option_label: null,
        count: null,
        percentage: null,
      });
      return;
    }

    options.forEach((opt, oi) => {
      rows.push({
        respondent_id: `${q.chartId ?? `Q${qi + 1}`}`, // identifiant "ligne" (pas un vrai respondent)
        question_id: safeCell(q.chartId ?? `Q${qi + 1}`) as any,
        question_label: safeCell(q.question) as any,
        variable_name: safeCell(variable) as any,
        option_code: oi + 1,
        option_label: safeCell(opt.label) as any,
        count: safeCell(opt.value ?? null) as any,
        percentage: safeCell(opt.percentage ?? null) as any,
      });
    });
  });

  return rows;
}

export function buildResponsesSynthetic(
  questions: QuestionWithView[],
  respondentCount: number
): ResponseRow[] {
  const rows: ResponseRow[] = [];

  const safeN =
    Number.isFinite(respondentCount) && respondentCount > 0
      ? Math.floor(respondentCount)
      : 0;

  for (let r = 0; r < safeN; r++) {
    const row: ResponseRow = {
      respondent_id: `r_${String(r + 1).padStart(5, "0")}`,
    };

    questions.forEach((q, qi) => {
      const variable = makeVarName(qi, q.question);
      const options = extractOptions(q);

      if (options.length === 0) {
        row[variable] = null;
        return;
      }

      // Multi → one-hot
      if (isMultiChoice(q)) {
        options.forEach((opt, oi) => {
          const p = typeof opt.value === "number" && safeN > 0 ? opt.value / safeN : 0;
          row[`${variable}__${oi + 1}`] = Math.random() < p ? 1 : 0;
        });
        return;
      }

      // Single → tirage pondéré par count si dispo, sinon random uniforme
      const weights = options.map((o) =>
        typeof o.value === "number" && o.value > 0 ? o.value : 1
      );
      const total = weights.reduce((a, b) => a + b, 0);
      let rnd = Math.random() * total;

      let chosen = 1;
      for (let i = 0; i < weights.length; i++) {
        rnd -= weights[i]!;
        if (rnd <= 0) {
          chosen = i + 1;
          break;
        }
      }

      row[variable] = chosen;
    });

    rows.push(row);
  }

  return rows;
}

export function buildResponses(
  questions: QuestionWithView[],
  respondentCount: number,
  mode: DatasetMode = "aggregated"
): ResponseRow[] {
  if (mode === "synthetic") return buildResponsesSynthetic(questions, respondentCount);
  return buildResponsesAggregated(questions);
}

// ---------------------------------------------
// CSV / Excel Export
// ---------------------------------------------

type CsvOptions = { delimiter?: ";" | "," };

function toCsv(rows: Record<string, any>[], delimiter: ";" | ",") {
  if (!rows.length) return "";

  // colonnes = union des keys
  const columns = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  const escape = (val: any) => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    const needsQuotes = s.includes('"') || s.includes("\n") || s.includes(delimiter);
    const out = s.replace(/"/g, '""');
    return needsQuotes ? `"${out}"` : out;
  };

  const header = columns.map(escape).join(delimiter);
  const lines = rows.map((row) => columns.map((c) => escape(row[c])).join(delimiter));
  return [header, ...lines].join("\n");
}

function downloadFile(filename: string, content: BlobPart, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportDatasetCsv(
  missionId: string,
  questions: QuestionWithView[],
  respondentCount: number,
  opts: CsvOptions & { mode?: DatasetMode } = {}
) {
  const delimiter = opts.delimiter ?? ";";
  const mode = opts.mode ?? "aggregated";

  const codebook = buildCodebook(questions);
  const responses = buildResponses(questions, respondentCount, mode);

  const codebookCsv = toCsv(codebook as any, delimiter);
  const responsesCsv = toCsv(responses as any, delimiter);

  downloadFile(`mission-${missionId}-codebook.csv`, codebookCsv, "text/csv;charset=utf-8");
  downloadFile(`mission-${missionId}-${mode}-responses.csv`, responsesCsv, "text/csv;charset=utf-8");
}

export async function exportDatasetExcel(
  missionId: string,
  questions: QuestionWithView[],
  respondentCount: number,
  mode: DatasetMode = "aggregated"
) {
  // npm i xlsx
  const XLSX = await import("xlsx");

  const codebook = buildCodebook(questions);
  const responses = buildResponses(questions, respondentCount, mode);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(codebook), "codebook");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(responses), "responses");

  XLSX.writeFile(wb, `mission-${missionId}-${mode}-dataset.xlsx`);
}
