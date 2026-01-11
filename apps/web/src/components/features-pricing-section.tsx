"use client";
import { Check } from "lucide-react";
import { useI18n } from "@/locales/client";

export default function FeaturesPricingSection() {
  const t = useI18n();
  const features = [
    t("pricing.features.unlimited_users_per_account"),
    t("pricing.features.live_interactive_dashboards"),
    t("pricing.features.ai_written_executive_summaries"),
    t("pricing.features.automated_brief_creation_using_ai"),
    t("pricing.features.data_from_150_cities_towns_and_regions"),
    t("pricing.features.up_to_90_questions_per_study"),
    t("pricing.features.twenty_five_question_formats"),
    t("pricing.features.target_from_eight_thousand_attributes"),
    t("pricing.features.video_photo_surveys"),
    t("pricing.features.real_time_response_validation_ai_cleaning"),
    t("pricing.features.download_in_ppt_xls_csv_formats"),
    t("pricing.features.filter_by_demo_geo_and_behavioral_patterns"),
  ];
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
          {t("pricing.everything_you_need_to_go_from_question_to_clarity")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              <Check className="w-6 h-6 text-primary mr-4 mt-1 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
