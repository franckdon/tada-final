"use client";

import { useAudiencesFilter } from "@/context/audiences-filter-context";
import { useI18n } from "@/locales/client";
import { cn } from "@tada/ui/lib/utils";
import { CheckCircleIcon, CircleIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

interface Section {
  id: string;
  name: string;
  completed: boolean | number; // false | 0 | 0.5 | true
}

export function ProgressSidebar() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("t");
  const mode = searchParams.get("mode");

  const t = useI18n();
  const form = useFormContext();
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

  // Met à jour completed=true si la section a des valeurs
  useEffect(() => {
    const subscription = form.watch((values) => {
      setSections((prev) =>
        prev.map((section) => {
          // audiences: on laisse l'autre effect gérer via activeFiltersCount
          if (section.id === "audiences") return section;

          const v = values?.[section.id];

          // string => trim
          if (typeof v === "string") {
            return { ...section, completed: v.trim().length > 0 };
          }

          // autres types (si jamais)
          return { ...section, completed: Boolean(v) };
        })
      );
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Audiences : complété si au moins 1 filtre
  useEffect(() => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === "audiences" ? { ...s, completed: activeFiltersCount > 0 } : s
      )
    );
  }, [activeFiltersCount]);

  const getBriefRating = useCallback(
    (score: number): string => {
      if (score === 10) return t("missions.progress.perfect");
      if (score >= 8) return t("missions.progress.great");
      if (score >= 6) return t("missions.progress.good");
      if (score >= 4) return t("missions.progress.fair");
      return t("missions.progress.empty");
    },
    [t]
  );

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

  // Helper pour les petits segments de progression
  const getFilledSegments = (completed: boolean | number) => {
    if (completed === true) return 3; // terminé
    if (completed === 0.5) return 2; // à moitié (si tu veux gérer ça plus tard)
    return 0; // non commencé
  };

  return (
    <aside
      className={cn(
        "h-full flex flex-col bg-slate-50 border-l border-slate-200 py-6 px-4 w-80",
        (templateId || mode) && "w-96"
      )}
    >
      {/* HEADER */}
      <div className="mb-4 shrink-0">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {t("missions.progress.sectionTitle") || "Progress"}
        </p>
        <h2 className="text-lg font-semibold text-slate-900">
          {t("missions.progress.title")}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {t("missions.progress.subtitle") ||
            "Keep filling in each section to improve your brief."}
        </p>
      </div>

      {/* LISTE SCROLLABLE */}
      <div className="flex-1 overflow-y-auto pr-1">
        <ul className="space-y-3 pb-4">
          {sections.map((section) => {
            const filled = getFilledSegments(section.completed);
            const isCompleted = section.completed === true;

            return (
              <li
                key={section.id}
                className="flex items-center justify-between rounded-md bg-white px-3 py-2 shadow-sm border border-slate-200"
              >
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <CircleIcon className="w-5 h-5 text-slate-300" />
                  )}

                  <span
                    className={cn(
                      "text-sm",
                      isCompleted
                        ? "text-emerald-600 font-medium"
                        : section.completed === 0.5
                          ? "text-amber-500"
                          : "text-slate-500"
                    )}
                  >
                    {section.name}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "h-1.5 w-4 rounded-full transition-colors duration-200",
                        idx < filled ? "bg-emerald-500" : "bg-slate-200"
                      )}
                    />
                  ))}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="pt-4 mt-2 border-t border-slate-200 flex flex-col items-center gap-3 shrink-0">
          {/* Texte en haut */}
          <div className="w-full">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {t("missions.progress.briefScoreLabel") || "Your brief score"}
            </p>
            <p className="text-sm font-medium text-slate-900">{briefRating}</p>
            <p className="text-xs text-slate-500 mt-1">
              {t("missions.progress.briefHelperText") ||
                "Answer more questions to improve the quality of your brief."}
            </p>
          </div>

          {/* Rond plus grand en bas */}
          <div className="relative h-28 w-28">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="
          M18 2.5
          a 15.5 15.5 0 1 1 0 31
          a 15.5 15.5 0 1 1 0 -31
        "
              />
              <path
                className="text-emerald-500"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="97.4"
                strokeDashoffset={97.4 - (97.4 * scorePercentage) / 100}
                d="
          M18 2.5
          a 15.5 15.5 0 1 1 0 31
          a 15.5 15.5 0 1 1 0 -31
        "
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-semibold text-slate-900">
                {briefScore.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
