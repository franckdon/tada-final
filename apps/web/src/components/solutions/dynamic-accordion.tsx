"use client";
import { useI18n } from "@/locales/client";
import React, { useState } from "react";
import { Plus, X } from "lucide-react";

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionData {
  title?: string;
  items?: AccordionItem[];
}

interface DynamicAccordionProps {
  data?: AccordionData;
}

const DynamicAccordion: React.FC<DynamicAccordionProps> = ({ data }) => {
  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    return null;
  }
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const t = useI18n();

  return (
    <section className="container-custom">
      <div className="p-4 lg:p-16 bg-gray-50">
        {/* Section Header */}
        <div className="text-center mb-16">
          {data.title && (
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t(data.title as any, {})}
          </h2>
          )}
        </div>

        <div className="divide-y divide-gray-200">
          {data.items.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={index} className="py-5">
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-xl font-semibold text-gray-900">
                    {t(item.question as any, {})}
                  </h3>

                  {isOpen ? (
                    <X className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isOpen && (
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {t(item.answer as any, {})}
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

export default DynamicAccordion;