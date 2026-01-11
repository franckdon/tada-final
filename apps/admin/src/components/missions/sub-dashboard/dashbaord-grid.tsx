"use client";

import { BarChart3 } from "lucide-react";
import { SurveyEditor } from "./items/survey-editor";
import { AddDashboardItem } from "./sub-dashboard-item";
import { ImageItem } from "./items/image-item";
import { SubDashboardItem } from "@prisma/client";
import { TextEditor } from "./items/text-editor";
import { useI18n } from "@/locales/client";
import { QuestionData, SurveyData } from "@/lib/utils";

interface DashboardGridProps {
  subDashboardId: string;
  items: SubDashboardItem[];
  isShared?: boolean;
  questionsData: QuestionData[];
  responseDb: SurveyData;
}

export function DashboardGrid({
  subDashboardId,
  items,
  isShared = true,
  questionsData,
  responseDb,
}: DashboardGridProps) {
  const t = useI18n();

  const AddButton = () => (
    <div className="text-center">
      <AddDashboardItem
        subDashboardId={subDashboardId}
        questionsData={questionsData}
        responseDb={responseDb}
      />
    </div>
  );

  const renderItem = (item: SubDashboardItem) => {
    switch (item.type) {
      case "text":
        return (
          <>
            <TextEditor
              key={item.id}
              id={item.id}
              content={item.content || ""}
              isShared={isShared}
            />
            <AddButton />
          </>
        );
      case "image":
        return (
          <>
            <ImageItem
              key={item.id}
              id={item.id}
              imageUrl={item.imageUrl || ""}
              isShared={isShared}
            />
            <AddButton />
          </>
        );
      case "survey":
        return (
          <>
            <SurveyEditor key={item.id} isShared={isShared} {...item} />{" "}
            <AddButton />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">{items.map(renderItem)}</div>

      {items.length <= 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("missions.addSubDashboard.empty.title") ||
              "Votre dashboard est vide"}
          </h3>
          <p className="text-gray-500 mb-4">
            {t("missions.addSubDashboard.empty.subtitle") ||
              "Commencez par ajouter des éléments à votre tableau de bord"}
          </p>

          <div className="text-center pt-4">
            <AddButton />
          </div>
        </div>
      )}
    </div>
  );
}
