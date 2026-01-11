// src/lib/export-csv.ts
export type CsvRow = Record<string, string | number | boolean | null | undefined>;

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // CSV escaping: wrap in quotes if contains comma, quote or newline
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadCsv(
  filename: string,
  rows: Array<Record<string, any>>,
  opts?: { delimiter?: ";" | "," }
) {
  const delimiter = opts?.delimiter ?? ";";
  const headers = Array.from(
    new Set(rows.flatMap((r) => Object.keys(r ?? {})))
  );

  const escape = (v: any) => {
    const s = String(v ?? "");
    const mustQuote = s.includes('"') || s.includes("\n") || s.includes(delimiter);
    const out = s.replace(/"/g, '""');
    return mustQuote ? `"${out}"` : out;
  };

  const csv = [
    headers.join(delimiter),
    ...rows.map((r) => headers.map((h) => escape(r?.[h])).join(delimiter)),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

