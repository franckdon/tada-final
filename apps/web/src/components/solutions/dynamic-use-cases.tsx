"use client";
import { useI18n } from "@/locales/client";
import React from "react";
import * as LucideIcons from "lucide-react";

interface UseCase {
  icon: string;
  title: string;
  description: string;
  benefits: string[];
  subheadline?: string;
}

interface UseCasesData {
  title: string;
  subtitle: string;
  nbrOfItems?: number;
  cases: UseCase[];
}

interface DynamicUseCasesProps {
  data?: UseCasesData;
}

const DynamicUseCases: React.FC<DynamicUseCasesProps> = ({ data }) => {
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Circle;
  };
  const t = useI18n();

  if (!data) return null;

  return (
    <section className="container-custom">
      <div className="p-4 sm:p-16 sm:py-24 bg-gray-50">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t(data.title as any, {})}
          </h2>

          {data.subtitle && t(data.subtitle as any, {}) !== data.subtitle && (
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t(data.subtitle as any, {})}
          </p>
          )}
        </div>

        {/* Use Cases Grid */}
        <div className={
          data.nbrOfItems
          ? `grid md:grid-cols-2 lg:grid-cols-${data.nbrOfItems} gap-8`
          : "grid md:grid-cols-2 gap-8"
        }>
          {data.cases.map((useCase, index) => {
            const Icon = getIcon(useCase.icon);

            return (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {t(useCase.title as any, {})}
                </h3>

                {useCase.subheadline && t(useCase.subheadline as any, {}) !== useCase.subheadline && (
                  <h6 className="text-md font-semibold text-gray-900 mb-4">
                    {t(useCase.subheadline as any, {})}
                  </h6>
                )}

                {useCase.description && t(useCase.description as any, {}) !== useCase.description && (
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {t(useCase.description as any, {})}
                </p>
                )}
                <ul className="space-y-2">
                  {useCase.benefits.map((benefit, benefitIndex) => (
                    <li
                      key={benefitIndex}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                      {t(benefit as any, {})}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DynamicUseCases;
