"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/locales/client";

export default function FaqSection() {
  const t = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };
  const faqs = [
    {
      question: t("pricing.faq.question_1"),
      answer: t("pricing.faq.answer_1"),
    },
    {
      question: t("pricing.faq.question_2"),
      answer: t("pricing.faq.answer_2"),
    },
    {
      question: t("pricing.faq.question_3"),
      answer: t("pricing.faq.answer_3"),
    },
    {
      question: t("pricing.faq.question_4"),
      answer: t("pricing.faq.answer_4"),
    },
    {
      question: t("pricing.faq.question_5"),
      answer: t("pricing.faq.answer_5"),
    },
    {
      question: t("pricing.faq.question_6"),
      answer: t("pricing.faq.answer_6"),
    },
    {
      question: t("pricing.faq.question_7"),
      answer: t("pricing.faq.answer_7"),
    },
    {
      question: t("pricing.faq.question_8"),
      answer: t("pricing.faq.answer_8"),
    },
  ];
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
          {t("pricing.faq.title")}
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex justify-between items-center"
              >
                <span className="font-semibold text-gray-900">
                  {faq.question}
                </span>
                {openFaq === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {openFaq === index && (
                <div className="px-6 py-4 bg-white">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
