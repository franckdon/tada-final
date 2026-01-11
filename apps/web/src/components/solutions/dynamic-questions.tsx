"use client";
import { useI18n } from "@/locales/client";
import React from "react";

interface Question {
  title: string;
  description: string;
}

interface QuestionsData {
  title: string;
  items: Question[];
}

interface DynamicQuestionsProps {
  data?: QuestionsData;
}

const DynamicQuestions: React.FC<DynamicQuestionsProps> = ({ data }) => {
  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    return null;
  }
  const t = useI18n();

  return (
    <section className="container-custom">
      <div className="py-16 sm:py-24">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t(data.title as any, {})}
          </h2>
        </div>

        {/* Use Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.items.map((question, index) => {

            return (
              <div
                key={index}
                className="border-gray-50 hover:bg-white p-8 hover:border-gray-100 hover:rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {t(question.title as any, {})}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {t(question.description as any, {})}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DynamicQuestions;
