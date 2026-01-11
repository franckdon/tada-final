"use client";

import { useI18n } from "@/locales/client";

export interface SectionOption {
  id: string;
  title: string;
}

interface QuestionSectionSelectorProps {
  sections: SectionOption[];
  selectedSectionId: string | null;
  onChange: (value: string | null) => void;
}

export function QuestionSectionSelector({
  sections,
  selectedSectionId,
  onChange,
}: QuestionSectionSelectorProps) {
  const t = useI18n();

  if (sections.length === 0) return null;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {/* missions.surveys.addNewQuestion.sectionSelectLabel */}
        {t("missions.surveys.addNewQuestion.sectionSelectLabel", {
          defaultValue: "Associer cette question à une section",
        })}
      </label>

      <select
        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        value={selectedSectionId ?? ""}
        onChange={(e) => onChange(e.target.value ? e.target.value : null)}
      >
        <option value="">
          {t("missions.surveys.addNewQuestion.noSection", {
            defaultValue: "Aucune section (question indépendante)",
          })}
        </option>

        {sections.map((section) => (
          <option key={section.id} value={section.id}>
            {section.title}
          </option>
        ))}
      </select>
    </div>
  );
}
