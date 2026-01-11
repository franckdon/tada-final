"use client";

import { useI18n } from "@/locales/client";
import { Input } from "@tada/ui/components/input";
import { Button } from "@tada/ui/components/button";
import { Plus, X } from "lucide-react";

interface MatrixQuestionSettingsProps {
  rows: string[];
  onRowsChange: (rows: string[]) => void;

  columns: string[];
  onColumnsChange: (columns: string[]) => void;
}

export function MatrixQuestionSettings({
  rows,
  onRowsChange,
  columns,
  onColumnsChange,
}: MatrixQuestionSettingsProps) {
  const t = useI18n();

  const updateRow = (index: number, value: string) => {
    onRowsChange(rows.map((r, i) => (i === index ? value : r)));
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    onRowsChange(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    onRowsChange([...rows, `Ligne ${rows.length + 1}`]);
  };

  const updateColumn = (index: number, value: string) => {
    onColumnsChange(columns.map((c, i) => (i === index ? value : c)));
  };

  const removeColumn = (index: number) => {
    if (columns.length <= 1) return;
    onColumnsChange(columns.filter((_, i) => i !== index));
  };

  const addColumn = () => {
    onColumnsChange([...columns, `Colonne ${columns.length + 1}`]);
  };

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Lignes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("missions.surveys.addNewQuestion.matrixRows")}
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto thin-scrollbar">
          {rows.map((row, index) => (
            <div className="flex items-center" key={index}>
              <Input
                value={row}
                onChange={(e) => updateRow(index, e.target.value)}
              />
              {rows.length > 1 && (
                <button
                  type="button"
                  className="ml-2 text-gray-400 hover:text-gray-600"
                  onClick={() => removeRow(index)}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-teal-500 hover:text-teal-700 flex items-center px-0"
            onClick={addRow}
          >
            <Plus size={14} className="mr-1" />
            {t("missions.surveys.addNewQuestion.addRow")}
          </Button>
        </div>
      </div>

      {/* Colonnes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("missions.surveys.addNewQuestion.matrixColumns")}
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto thin-scrollbar">
          {columns.map((col, index) => (
            <div className="flex items-center" key={index}>
              <Input
                value={col}
                onChange={(e) => updateColumn(index, e.target.value)}
              />
              {columns.length > 1 && (
                <button
                  type="button"
                  className="ml-2 text-gray-400 hover:text-gray-600"
                  onClick={() => removeColumn(index)}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-teal-500 hover:text-teal-700 flex items-center px-0"
            onClick={addColumn}
          >
            <Plus size={14} className="mr-1" />
            {t("missions.surveys.addNewQuestion.addColumn")}
          </Button>
        </div>
      </div>
    </div>
  );
}
