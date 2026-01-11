// src/components/missions/boards/modals/export-options-dialog.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@tada/ui/components/dialog";
import { Button } from "@tada/ui/components/button";
import { cn } from "@tada/ui/lib/utils";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import type { QuestionWithView } from "@/lib/chart-filtering";
import {
  exportDatasetCsv,
  exportDatasetExcel,
} from "@/lib/exports/dataset-export";
import {
  exportFullSurveyPdf,
  exportFullSurveyPpt,
} from "@/lib/exports/full-survey-export";

type ExportFormat = "ppt" | "excel" | "csv" | "pdf";

interface ExportOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  missionId: string;
  questions: QuestionWithView[];
  totalResponses: number;
}

export function ExportOptionsDialog({
  open,
  onOpenChange,
  missionId,
  questions,
  totalResponses,
}: ExportOptionsDialogProps) {
  const [activeFormat, setActiveFormat] = useState<ExportFormat>("ppt");
  const [csvDelimiter, setCsvDelimiter] = useState<";" | ",">(";");
  const [loading, setLoading] = useState(false);

  const label = useMemo(() => {
    switch (activeFormat) {
      case "ppt":
        return "Download PowerPoint";
      case "excel":
        return "Download Excel";
      case "csv":
        return "Download CSV";
      case "pdf":
        return "Download PDF";
      default:
        return "Download";
    }
  }, [activeFormat]);

  const handleDownload = async () => {
    try {
      setLoading(true);

      if (!missionId) throw new Error("missionId manquant");
      if (!questions?.length) throw new Error("Aucune donnée à exporter");

      if (activeFormat === "csv") {
        exportDatasetCsv(missionId, questions, totalResponses, {
          delimiter: csvDelimiter,
          mode: "aggregated",
        });

        toast({
          title: "Export CSV prêt",
          description: "Codebook + responses ont été téléchargés.",
        });

        return;
      }

      if (activeFormat === "excel") {
        await exportDatasetExcel(
          missionId,
          questions,
          totalResponses,
          "aggregated"
        );

        toast({
          title: "Export Excel prêt",
          description: "Dataset (codebook + responses) téléchargé.",
        });

        return;
      }

      if (activeFormat === "pdf") {
        await exportFullSurveyPdf(`mission-${missionId}-questionnaire.pdf`);

        toast({
          title: "Export PDF prêt",
          description: "Questionnaire complet téléchargé.",
        });

        return;
      }

      if (activeFormat === "ppt") {
        await exportFullSurveyPpt(`mission-${missionId}-questionnaire.pptx`);

        toast({
          title: "Export PPT prêt",
          description: "Questionnaire complet téléchargé.",
        });

        return;
      }
    } catch (e) {
      console.error("[ExportOptionsDialog] export failed:", e);
      toast({
        title: "Export impossible",
        description: e instanceof Error ? e.message : "Erreur inconnue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Colonne gauche : formats */}
          <div className="w-48 border-r border-slate-200 bg-slate-50">
            <div className="px-6 py-4 border-b border-slate-200">
              <p className="font-semibold text-slate-900 text-[15px]">
                Export options
              </p>
            </div>

            <nav className="flex flex-col p-2 gap-1">
              <FormatNavItem
                label="PowerPoint"
                format="ppt"
                icon="ppt"
                active={activeFormat === "ppt"}
                onClick={() => setActiveFormat("ppt")}
              />
              <FormatNavItem
                label="Excel"
                format="excel"
                icon="excel"
                active={activeFormat === "excel"}
                onClick={() => setActiveFormat("excel")}
              />
              <FormatNavItem
                label="CSV"
                format="csv"
                icon="csv"
                active={activeFormat === "csv"}
                onClick={() => setActiveFormat("csv")}
              />
              <FormatNavItem
                label="PDF"
                format="pdf"
                icon="pdf"
                active={activeFormat === "pdf"}
                onClick={() => setActiveFormat("pdf")}
              />
            </nav>
          </div>

          {/* Colonne droite : contenu */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-[15px] font-semibold">
                  {getRightTitle(activeFormat)}
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                  {getRightDescription(activeFormat)}
                </DialogDescription>
              </DialogHeader>

              <DialogClose asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </DialogClose>
            </div>

            <div className="flex-1 p-6 flex flex-col gap-4">
              {activeFormat === "csv" && (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <p className="text-sm font-medium text-slate-900">
                    Delimiter format
                  </p>

                  <div className="space-y-2 text-sm text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="csv-delimiter"
                        value=";"
                        checked={csvDelimiter === ";"}
                        onChange={() => setCsvDelimiter(";")}
                      />
                      <span>Use EU delimiter format (;)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="csv-delimiter"
                        value=","
                        checked={csvDelimiter === ","}
                        onChange={() => setCsvDelimiter(",")}
                      />
                      <span>Use US/UK delimiter format (,)</span>
                    </label>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Exports a clean dataset (codebook + responses).
                  </p>
                </div>
              )}

              {activeFormat === "ppt" && (
                <p className="text-sm text-slate-500">
                  Download the entire survey with all questions in their current
                  views. One slide per question.
                </p>
              )}

              {activeFormat === "excel" && (
                <p className="text-sm text-slate-500">
                  Export a clean Excel dataset with 2 sheets: “codebook” and
                  “responses”.
                </p>
              )}

              {activeFormat === "pdf" && (
                <p className="text-sm text-slate-500">
                  Download a PDF report of the full questionnaire. One page per
                  question.
                </p>
              )}

              <div className="mt-auto flex justify-end gap-3 pt-4">
                <Button
                  size="sm"
                  onClick={handleDownload}
                  disabled={loading || !questions?.length}
                >
                  {loading ? "Generating…" : label}
                </Button>
              </div>

              {!questions?.length && (
                <p className="text-xs text-slate-500">
                  No data available for export.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface FormatNavItemProps {
  label: string;
  format: ExportFormat;
  icon: "ppt" | "excel" | "csv" | "pdf";
  active: boolean;
  onClick: () => void;
}

function FormatNavItem({ label, active, onClick }: FormatNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
        "transition-colors",
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-600 hover:bg-slate-100"
      )}
    >
      {/* Icône simple */}
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-[10px] font-semibold text-slate-700">
        {label[0]}
      </span>
      <span>{label}</span>
    </button>
  );
}

function getRightTitle(format: ExportFormat) {
  switch (format) {
    case "ppt":
      return "PowerPoint export";
    case "excel":
      return "Excel export";
    case "csv":
      return "CSV export";
    case "pdf":
      return "PDF export";
  }
}

function getRightDescription(format: ExportFormat) {
  switch (format) {
    case "ppt":
      return "Exports the full questionnaire as a deck (1 slide per question).";
    case "excel":
      return "Exports a clean dataset with a codebook sheet and a responses sheet.";
    case "csv":
      return "Exports a clean dataset (codebook + responses) as CSV files.";
    case "pdf":
      return "Exports the full questionnaire as a multi-page PDF (1 page per question).";
  }
}
