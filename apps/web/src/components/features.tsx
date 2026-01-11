"use client";

import FeatureBlock from "./feature-block";
import { useI18n } from "@/locales/client";
export const Features: React.FC = () => {
  const t = useI18n();
  return (
    <section className="">
      <div className="container-custom px-6 py-12 sm:p-16 space-y-12 bg-gray-100">
        <div className="">
          <h3 className="text-4xl md:text-5xl font-bold text-center mb-4 text-black">
            {t("home.what_sets_tada_apart.title")}
          </h3>
          <p className="text-center text-gray-600">
            {t("home.what_sets_tada_apart.description")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-x-24 gap-y-12">
          <FeatureBlock
            icon="TimerReset"
            title={t("home.what_sets_tada_apart.features.title")}
            description={t("home.what_sets_tada_apart.features.description")}
          />

          <FeatureBlock
            icon="DatabaseZap"
            title={t("home.what_sets_tada_apart.features.title_2")}
            description={t("home.what_sets_tada_apart.features.description_2")}
          />

          <FeatureBlock
            icon="LayoutDashboard"
            title={t("home.what_sets_tada_apart.features.title_3")}
            description={t("home.what_sets_tada_apart.features.description_3")}
          />

          <FeatureBlock
            icon="Coins"
            title={t("home.what_sets_tada_apart.features.title_4")}
            description={t("home.what_sets_tada_apart.features.description_4")}
          />

          <FeatureBlock
            icon="LayoutDashboard"
            title={t("home.what_sets_tada_apart.features.title_5")}
            description={t("home.what_sets_tada_apart.features.description_5")}
          />

          <FeatureBlock
            icon="Coins"
            title={t("home.what_sets_tada_apart.features.title_6")}
            description={t("home.what_sets_tada_apart.features.description_6")}
          />
        </div>
      </div>
    </section>
  );
};
