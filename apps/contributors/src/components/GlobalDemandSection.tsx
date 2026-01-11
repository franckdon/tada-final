"use client";

import Image from "next/image";
import { useI18n } from "../locales/client";

export function GlobalDemandSection() {
  const t = useI18n();

  return (
    <section className="py-12 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#282828] mb-4 lg:mb-6">
            {t("common.globalDemandTitle")}
          </h2>
          <p className="text-base lg:text-lg font-light text-[#48505E] max-w-3xl mx-auto">
            {t("common.globalDemandDescription")}
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 bg-[#F9FAFB] lg:rounded-2xl items-center">
          <div className="grid grid-cols-2 pb-6 gap-6 lg:gap-8 px-3">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-6xl font-bold text-[#FF5B4A] mb-2">
                +5M
              </div>
              <p className="text-sm lg:text-base text-[#48505E]">
                {t("common.contributorsAfrica")}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-6xl font-bold text-[#FF5B4A] mb-2">
                $150
              </div>
              <p className="text-sm lg:text-base text-[#48505E]">
                {t("common.salesPoints")}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-6xl font-bold text-[#FF5B4A] mb-2">
                +90
              </div>
              <p className="text-sm lg:text-base text-[#48505E]">
                {t("common.citiesCovered")}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-6xl font-bold text-[#FF5B4A] mb-2">
                +50
              </div>
              <p className="text-sm lg:text-base text-[#48505E]">
                {t("common.partnerCompanies")}
              </p>
            </div>
          </div>
          <div className="relative order-first lg:order-last">
            <Image
              src="/images/office-stats.png"
              alt="Office statistics"
              width={400}
              height={1}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
