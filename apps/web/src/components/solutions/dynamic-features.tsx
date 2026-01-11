"use client";
import { useI18n } from "@/locales/client";
import React from "react";
import * as LucideIcons from "lucide-react";

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesData {
  title: string;
  subtitle: string;
  subheadline?: string;
  nbrOfItems?: number;
  items: FeatureItem[];
}

interface DynamicFeaturesProps {
  data?: FeaturesData;
}

const DynamicFeatures: React.FC<DynamicFeaturesProps> = ({ data }) => {
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Circle;
  };
  const t = useI18n();

  if (!data) return null;

  return (
    <section className="container-custom">
      <div className="p-4 sm:p-16 bg-gray-50">
        {/* Section Header */}
        <div className="text-center mb-16">
          {data.title && t(data.title as any, {}) !== data.title && (
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t(data.title as any, {})}
          </h2>
          )}
          {data.subheadline && t(data.subheadline as any, {}) !== data.subheadline && (
            <p className="text-xl sm:text-xl text-gray-900 mb-4">
              {t(data.subheadline as any, {})}
            </p>
          )}

          {data.subtitle && t(data.subtitle as any, {}) !== data.subtitle && (
          <h3 className="text-2xl text-gray-600 font-bold max-w-3xl mx-auto">
            {t(data.subtitle as any, {})}
          </h3>
          )}
        </div>

        {/* Features Grid */}
        <div className={
          data.nbrOfItems 
          ? `grid md:grid-cols-2 lg:grid-cols-${data.nbrOfItems} gap-8`
          : "grid md:grid-cols-2 gap-8"
        }>
          {data.items.map((feature, index) => {
            const Icon = getIcon(feature.icon);

            return (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                
                {feature.title && t(feature.title as any, {}) !== feature.title && (
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  {t(feature.title as any, {})}
                </h4>
                )}

                {feature.description && t(feature.description as any, {}) !== feature.description && (
                <p className="text-gray-600 leading-relaxed">
                  {t(feature.description as any, {})}
                </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DynamicFeatures;
