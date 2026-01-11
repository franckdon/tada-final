"use client";

import React from "react";
import { Briefcase, Star, TrendingUp, Zap, Users, Heart } from "lucide-react";
import { useI18n } from "@/locales/client";

const WhatMakesUsUnique = () => {
  const t = useI18n();

  const values = [
    {
      icon: Briefcase,
      title: t("about_us.what_makes_us_unique.take_ownership"),
      emoji: "💼",
      description: t(
        "about_us.what_makes_us_unique.take_ownership_description"
      ),
    },
    {
      icon: Star,
      title: t("about_us.what_makes_us_unique.be_positive"),
      emoji: "🌟",
      description: t("about_us.what_makes_us_unique.be_positive_description"),
    },
    {
      icon: TrendingUp,
      title: t("about_us.what_makes_us_unique.raise_the_bar"),
      emoji: "🔥",
      description: t("about_us.what_makes_us_unique.raise_the_bar_description"),
    },
    {
      icon: Zap,
      title: t("about_us.what_makes_us_unique.think_and_move_fast"),
      emoji: "⚡",
      description: t(
        "about_us.what_makes_us_unique.think_and_move_fast_description"
      ),
    },
    {
      icon: Users,
      title: t("about_us.what_makes_us_unique.stay_humble"),
      emoji: "🤝",
      description: t("about_us.what_makes_us_unique.stay_humble_description"),
    },
    {
      icon: Heart,
      title: t("about_us.what_makes_us_unique.deeply_care"),
      emoji: "❤️",
      description: t("about_us.what_makes_us_unique.deeply_care_description"),
    },
  ];
  return (
    <section id="values" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("about_us.what_makes_us_unique.title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("about_us.what_makes_us_unique.description")}
          </p>
        </div>

        <div className="mb-16 bg-gradient-to-r from-orange-50 to-orange-100 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {t("about_us.what_makes_us_unique.what_makes_us_tick")}
          </h3>
          <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
            {t("about_us.what_makes_us_unique.what_makes_us_tick_description")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-2xl hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4 group-hover:bg-primary transition-colors">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhatMakesUsUnique;
