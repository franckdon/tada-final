"use client";
import {
  Users,
  Zap,
  Globe,
  Shield,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { useI18n } from "@/locales/client";

export default function BenefitsSection() {
  const t = useI18n();
  const benefits = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: t("pricing.benefits.easy"),
      description: t("pricing.benefits.easy_description"),
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: t("pricing.benefits.fast"),
      description: t("pricing.benefits.fast_description"),
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: t("pricing.benefits.reach"),
      description: t("pricing.benefits.reach_description"),
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: t("pricing.benefits.expert_support"),
      description: t("pricing.benefits.expert_support_description"),
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: t("pricing.benefits.real_quality"),
      description: t("pricing.benefits.real_quality_description"),
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: t("pricing.benefits.clear_reporting"),
      description: t("pricing.benefits.clear_reporting_description"),
    },
  ];
  return (
    <section className="py-20 px-4 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">
          {t("pricing.benefits.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg hover:bg-gray-800 transition-colors duration-300"
            >
              <div className="bg-gradient-to-br from-primary/80 to-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
              <p className="text-gray-300 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
