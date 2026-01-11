"use client";

import { useState } from "react";
import TabNavigation from "./ui/tab-navigation";
import SolutionCard from "./solution-card";
import { useI18n } from "@/locales/client";

export default function SolutionsFilter({
  features,
  categories,
}: {
  features: readonly any[];
  categories: Record<string, string>;
}) {
  const [activeTab, setActiveTab] = useState("All");
  const t = useI18n();

  const filteredFeatures =
    activeTab === "All"
      ? features
      : features.filter((feature) => feature.category === activeTab);

  return (
    <div>
      <TabNavigation
        categories={categories}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredFeatures.map((feature) => {
          // 🔑 clé de traduction basée sur l’ID
          const translationKey = `solutions.featuresByUseCase.${feature.id}`;

          return (
            <SolutionCard
              key={feature.id}
              title={t(`${translationKey}.title` as any, {})}
              description={t(`${translationKey}.description` as any, {})}
              image={feature.image}
              link={feature.link}
              solutionFamily= "use-case"
            />
          );
        })}
      </div>
    </div>
  );
}