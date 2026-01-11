"use client";
import { useAudiencesFilter } from "@/context/audiences-filter-context";
import { cn } from "@/lib/utils";
import { useI18n } from "@/locales/client";
import { CheckCircleIcon, CircleIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

interface Section {
  id: string;
  name: string;
  completed: boolean | number;
}

export function ProgressSidebar() {
  const t = useI18n();
  const form = useFormContext();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("t");
  const mode = searchParams.get("mode");

  const { activeFiltersCount } = useAudiencesFilter();
  const [sections, setSections] = useState<Section[]>([
    {
      id: "problemSummary",
      name: t("missions.createMission.form.problemSummary"),
      completed: false,
    },
    {
      id: "objectives",
      name: t("missions.createMission.form.strategicGoal"),
      completed: false,
    },
    {
      id: "assumptions",
      name: t("missions.createMission.form.assumptions"),
      completed: false,
    },
    {
      id: "audiences",
      name: t("missions.createMission.form.audiences"),

      completed: false,
    },
  ]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      // biome-ignore lint/complexity/noForEach: <explanation>
      sections.forEach((section) => {
        if (values[section.id]) {
          setSections((prev) =>
            prev.map((s) =>
              s.id === section.id
                ? {
                    ...s,
                    completed: Boolean(values[section.id]),
                  }
                : s
            )
          );
        }
      });
    });

    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (activeFiltersCount > 0) {
      setSections((prev) =>
        prev.map((s) => (s.id === "audiences" ? { ...s, completed: true } : s))
      );
    }
  }, [activeFiltersCount]);

  const getBriefRating = useCallback((score: number): string => {
    if (score === 10) return t("missions.progress.perfect");
    if (score >= 8) return t("missions.progress.great");
    if (score >= 6) return t("missions.progress.good");
    if (score >= 4) return t("missions.progress.fair");
    return t("missions.progress.empty");
  }, []);

  const { briefScore, briefRating, scorePercentage } = useMemo(() => {
    const completedSections = sections.filter(
      (section) => section.completed === true
    ).length;
    const totalSections = sections.length;
    const score = Number(((completedSections / totalSections) * 10).toFixed(1));

    return {
      briefScore: score,
      briefRating: getBriefRating(score),
      scorePercentage: (score / 10) * 100,
    };
  }, [sections, getBriefRating]);

  return (
    <div
      className={cn(
        "h-full flex flex-col justify-between bg-white dark:bg-gray-900  py-6 px-4 w-80",
        (templateId || mode) && "w-1/3"
      )}
    >
      <div className="mb-6">
        <h2 className="text-lg font-medium ">{t("missions.progress.title")}</h2>
      </div>

      <div className="flex-grow">
        <ul className="space-y-4">
          {sections.map((section) => (
            <li key={section.id} className="flex items-center">
              {section.completed === true ? (
                <div className="w-5 h-5 rounded-full  flex items-center justify-center mr-3">
                  <CheckCircleIcon className="w-8 h-8 text-teal-500" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full  flex items-center justify-center mr-3">
                  <CircleIcon className="w-8 h-8 text-gray-500" />
                </div>
              )}
              <span
                className={`${
                  section.completed === true
                    ? "text-teal-500"
                    : section.completed === 0.5
                    ? "text-yellow-500"
                    : "text-gray-400"
                }`}
              >
                {section.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
