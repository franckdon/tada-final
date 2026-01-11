"use client";

import React from "react";
import { useI18n } from "@/locales/client";
import SolutionCard from "./../solution-card";

import {
  featuresByUseCase,
} from "@/components/solutions/data";

interface DynamicMoreProps {
  title: string;
  category?: string;
  family?: string;
  industry?: string;
}

const DynamicMore: React.FC<DynamicMoreProps> = ({ title, category, family, industry }) => {
  const t = useI18n();

  // Filtrage des features à afficher
  const filteredSolutions = family === "industry" 
    ? featuresByUseCase.filter(
      (feature) => feature.industry === industry
    )
    : featuresByUseCase.filter(
      (feature) => feature.category === category && feature.title !== title
    );

  // Vérification de sécurité
  if (!filteredSolutions || !Array.isArray(filteredSolutions) || filteredSolutions.length === 0) {
    return null;
  }

  return (
    <section className="container-custom">
      <div className="md:py-16">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {family === "industry" 
              ? t("solutions.featuresByIndustry.more_solution_title") +" "+ t(industry as any, {})
              : t("solutions.featuresByUseCase.more_solution_title")
            }
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSolutions.map((feature) => {
            const translationKey = `solutions.featuresByUseCase.${feature.id}`;

            return (
              <SolutionCard
                key={feature.id}
                title={t(`${translationKey}.title` as any, {})}
                description={t(`${translationKey}.description` as any, {})}
                image={feature.image}
                link={feature.link}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DynamicMore;