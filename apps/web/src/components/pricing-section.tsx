"use client";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/locales/client";
import { useRouter } from "next/navigation";
export default function PricingSection() {
  const t = useI18n();
  const pricingTiers = [
    {
      name: t("pricing.pricing_section.pack_1"),
      description: t("pricing.pricing_section.pack_1_description"),
      features: [
        t("pricing.pricing_section.pack_1_features_1"),
        t("pricing.pricing_section.pack_1_features_2"),
        t("pricing.pricing_section.pack_1_features_3"),
        t("pricing.pricing_section.pack_1_features_4"),
        t("pricing.pricing_section.pack_1_features_5"),
      ],
      cta: t("pricing.pricing_section.pack_1_cta"),
      popular: false,
    },
    {
      name: t("pricing.pricing_section.pack_2"),
      description: t("pricing.pricing_section.pack_2_description"),
      features: [
        t("pricing.pricing_section.pack_2_features_1"),
        t("pricing.pricing_section.pack_2_features_2"),
        t("pricing.pricing_section.pack_2_features_3"),
        t("pricing.pricing_section.pack_2_features_4"),
        t("pricing.pricing_section.pack_2_features_5"),
        t("pricing.pricing_section.pack_2_features_6"),
      ],
      cta: t("pricing.pricing_section.pack_2_cta"),
      popular: true,
    },
    {
      name: t("pricing.pricing_section.pack_3"),
      description: t("pricing.pricing_section.pack_3_description"),
      features: [
        t("pricing.pricing_section.pack_3_features_1"),
        t("pricing.pricing_section.pack_3_features_2"),
        t("pricing.pricing_section.pack_3_features_3"),
        t("pricing.pricing_section.pack_3_features_4"),
        t("pricing.pricing_section.pack_3_features_5"),
      ],
      cta: t("pricing.pricing_section.pack_3_cta"),
      popular: false,
    },
    {
      name: t("pricing.pricing_section.pack_4"),
      description: t("pricing.pricing_section.pack_4_description"),
      features: [
        t("pricing.pricing_section.pack_4_features_1"),
        t("pricing.pricing_section.pack_4_features_2"),
        t("pricing.pricing_section.pack_4_features_3"),
        t("pricing.pricing_section.pack_4_features_4"),
        t("pricing.pricing_section.pack_4_features_5"),
      ],
      cta: t("pricing.pricing_section.pack_4_cta"),
      popular: false,
    },
  ];
  const router = useRouter();
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                tier.popular ? "ring-2 ring-primary scale-105" : ""
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {t("pricing.most_popular")}
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {tier.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {tier.description}
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => router.push("/schedule-a-demo")}
                className="w-full bg-gradient-to-r from-blue-200 to-primary text-white font-semibold hover:from-blue-200 hover:to-primary transition-all duration-300 transform hover:scale-105"
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
