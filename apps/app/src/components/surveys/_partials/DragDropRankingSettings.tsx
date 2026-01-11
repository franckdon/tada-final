"use client";

import { Input } from "@tada/ui/components/input";
import { Button } from "@tada/ui/components/button";
import { Plus, X } from "lucide-react";
import { useI18n } from "@/locales/client";

interface DragDropRankingSettingsProps {
  options: string[];
  onOptionsChange: (options: string[]) => void;
}

export function DragDropRankingSettings({
  options,
  onOptionsChange,
}: DragDropRankingSettingsProps) {
  const t = useI18n();

  const updateOption = (index: number, value: string) => {
    onOptionsChange(options.map((o, i) => (i === index ? value : o)));
  };

  const removeOption = (index: number) => {
    if (options.length <= 1) return; // au moins 1
    onOptionsChange(options.filter((_, i) => i !== index));
  };

  const addOption = () => {
    onOptionsChange([
      ...options,
      `${t("missions.surveys.addNewQuestion.option", {
        index: options.length + 1,
        defaultValue: `Option ${options.length + 1}`,
      })}`,
    ]);
  };

  return (
    <div className="mb-6 space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t("missions.surveys.addNewQuestion.rankingOptionsLabel", {
          defaultValue: "Éléments à classer (ordre de préférence)",
        })}
      </label>

      <p className="text-xs text-gray-500 mb-2">
        {t("missions.surveys.addNewQuestion.rankingOptionsHelp", {
          defaultValue:
            "Ces éléments seront affichés dans une liste que le répondant pourra réordonner par glisser-déposer.",
        })}
      </p>

      <div className="space-y-2 max-h-80 overflow-y-auto thin-scrollbar">
        {options.map((option, index) => (
          <div className="flex items-center" key={index}>
            {/* Petit badge de position */}
            <span className="w-7 text-xs text-gray-400">{index + 1}.</span>

            <Input
              className="flex-1"
              name={`ranking-option-${index}`}
              value={option}
              placeholder={`Élément ${index + 1}`}
              onChange={(e) => updateOption(index, e.target.value)}
            />

            {options.length > 1 && (
              <button
                type="button"
                className="ml-2 text-gray-400 hover:text-gray-600"
                onClick={() => removeOption(index)}
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 flex items-center gap-1"
          onClick={addOption}
        >
          <Plus size={14} />
          {t("missions.surveys.addNewQuestion.addRankingOption", {
            defaultValue: "Ajouter un élément",
          })}
        </Button>
      </div>
    </div>
  );
}
