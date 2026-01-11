"use client";

import { useState } from "react";
import { BarChart3, Plus } from "lucide-react";
import { SurveyEditor } from "./items/survey-editor";
import { AddDashboardItem } from "./sub-dashboard-item";
import { ImageItem } from "./items/image-item";
import { SubDashboardItem } from "@prisma/client";
import { TextEditor } from "./items/text-editor";
import { useI18n } from "@/locales/client";
import { QuestionData, SurveyData } from "@/lib/utils";
import { ClientVeltWrapper } from "@/app/[locale]/(dashboard)/client-velt-wrapper";

interface DashboardGridProps {
  subDashboardId: string;
  items: SubDashboardItem[];
  isShared?: boolean;
  questionsData: QuestionData[];
  responseDb: SurveyData;
  user: any;
}

type ViewMode = "standard" | "insight";

export function DashboardGrid({
  subDashboardId,
  items,
  isShared = true,
  questionsData,
  responseDb,
  user,
}: DashboardGridProps) {
  const t = useI18n();
  const hasItems = items.length > 0;

  const [viewMode, setViewMode] = useState<ViewMode>("standard");

  const renderItemContent = (item: SubDashboardItem) => {
    switch (item.type) {
      case "text":
        return (
          <TextEditor
            key={item.id}
            id={item.id}
            content={item.content || ""}
            isShared={isShared}
          />
        );

      case "image":
        return (
          <ImageItem
            key={item.id}
            id={item.id}
            imageUrl={item.imageUrl || ""}
            isShared={isShared}
          />
        );

      case "survey":
        return (
          <SurveyEditor
            key={item.id}
            isShared={isShared}
            {...item}
            questionsData={questionsData}
            responseDb={responseDb}
            viewMode={viewMode}
          />
        );

      default:
        return null;
    }
  };

  const AddTile = () => (
    <div className="h-full min-h-[220px] rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 dark:bg-slate-900/20 flex flex-col items-center justify-center gap-3 text-center">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Plus className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {t("missions.addSubDashboard.addItemTitle") ??
            "Ajouter un élément au sous-dashboard"}
        </p>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Texte d’insight, graphique, image… construisez votre vue d’analyse.
        </p>
      </div>
      <AddDashboardItem
        subDashboardId={subDashboardId}
        questionsData={questionsData}
        responseDb={responseDb}
      />
    </div>
  );

  // ---- ÉTAT VIDE ----------------------------------------

  if (!hasItems) {
    return (
      <ClientVeltWrapper user={user}>
        <div className="rounded-2xl border bg-white shadow-sm p-10 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
            <BarChart3 className="h-10 w-10 text-slate-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {t("missions.addSubDashboard.empty.title") ||
                "Votre sous-dashboard est vide"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t("missions.addSubDashboard.empty.subtitle") ||
                "Ajoutez vos graphiques, textes d’insights et visuels pour construire une vue d’analyse claire et actionnable."}
            </p>
          </div>

          <div className="max-w-sm mx-auto">
            <AddTile />
          </div>
        </div>
      </ClientVeltWrapper>
    );
  }

  // ---- VUE STANDARD / INSIGHT ----------------------------------------

  const gridClass =
    viewMode === "standard"
      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      : "grid grid-cols-1 gap-6";

  return (
    <ClientVeltWrapper user={user}>
      <div className="space-y-4">
        {/* Barre top avec switch de vue + bouton d’ajout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex h-6 items-center rounded-full border px-2">
              {items.length} élément(s)
            </span>
            <span className="hidden sm:inline text-[11px]">
              Vue{" "}
              {viewMode === "standard" ? "standard" : "insight / présentation"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Switch vue standard / insight */}
            <div className="inline-flex rounded-full border bg-white p-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("standard")}
                className={`px-3 py-1 rounded-full transition text-xs ${
                  viewMode === "standard"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600"
                }`}
              >
                Vue standard
              </button>
              <button
                type="button"
                onClick={() => setViewMode("insight")}
                className={`px-3 py-1 rounded-full transition text-xs ${
                  viewMode === "insight"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600"
                }`}
              >
                Vue insight
              </button>
            </div>

            {/* bouton d’ajout rapide */}
            <div className="hidden sm:block">
              <AddDashboardItem
                subDashboardId={subDashboardId}
                questionsData={questionsData}
                responseDb={responseDb}
              />
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className={gridClass}>
          {items.map((item) => {
            const isSurvey = item.type === "survey";

            const colSpanClass =
              viewMode === "standard" && isSurvey
                ? "md:col-span-2 xl:col-span-3"
                : "";

            return (
              <div key={item.id} className={colSpanClass}>
                {renderItemContent(item)}
              </div>
            );
          })}

          {/* Tile d’ajout en fin de grid */}
          <AddTile />
        </div>
      </div>
    </ClientVeltWrapper>
  );
}
