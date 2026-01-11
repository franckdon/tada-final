import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { generateMetadata } from "../../metadata";
import DynamicTrustedBy from "@/components/solution-trusted-by";
import CapabilitiesSection from "@/components/capabilities/CapabilitiesSection";
import SolutionsFilter from "@/components/solutions-filter";
import { getI18n } from "@/locales/server";
import { Button } from "@tada/ui/components/button";
import React from "react";

import {
  featuresByUseCase,
} from "@/components/solutions/data";

export const metadata = generateMetadata({
  title: "Solutions | Tada",
  description:
    "Discover Tada's data intelligence solutions that provide actionable insights for businesses and organizations across industries.",
});

export default async function SolutionsPage() {
  const t = await getI18n();
  const categoriesByUseCase = {
    All: t("solutions.categoriesByUseCase.all"),
    Perception: t("solutions.categoriesByUseCase.perception"),
    Innovation: t("solutions.categoriesByUseCase.innovation"),
    Strategy: t("solutions.categoriesByUseCase.strategy"),
    Tracking: t("solutions.categoriesByUseCase.tracking"),
  };
  return (
    <div className="py-8 bg-white space-y-16">
      {/* Solutions Overview */}
      <section className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="col-span-1 block md:hidden h-full">
            <Image src="/images/international-development.jpg" width={450} height={320} alt="" className="w-full h-auto"/>
          </div>
          <div className="col-span-1 flex flex-col justify-center h-full">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-rational-bold leading-tight mb-6">
                {t("solutions.userCase.title")}
              </h1>
              <p className="text-lg md:text-xl mb-8 ">
                {t("solutions.userCase.subtitle")}
              </p>

              <div className="flex flex-wrap md:flex-nowrap items-start justify-start gap-5 mb-8">
                <Image src="/images/GDPR-Regulated_EN.svg" width={130} height={24} alt="" className="max-w-[130px] w-full h-auto"/>
                <Image src="/images/SSL-Encryption_EN.svg" width={161} height={24} alt="" className="max-w-[161px] w-full h-auto"/>
              </div>

              <Button
                asChild
                className="inline-flex items-center justify-center group"
              >
                <Link href="/schedule-a-demo">
                  {t("solutions.userCase.cta.title")}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="col-span-1 hidden md:block h-full">
            <Image src="/images/international-development.jpg" width={450} height={320} alt="" className="w-full h-auto"/>
          </div>
        </div>
      </section>

      <section className="container-custom">
        <div className="py-16 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-10">
              {t("solutions.trustedBy.page" as any, {})
                .split("\n")
                .map((line, index) => (
                  <React.Fragment key={index}>
                    {/* Ajouter un saut de ligne seulement après la 1ère ligne */}
                    {line}
                    {index === 0 && <br className="hidden md:block" />}
                  </React.Fragment>
                ))}
            </h2>

            <DynamicTrustedBy />

          </div>
        </div>
      </section>

      <section className="container-custom">
        <h2 className="text-2xl md:text-3xl font-rational-bold mb-4 text-center">
          {t("solutions.menu.title")}
        </h2>

        <SolutionsFilter
          features={featuresByUseCase}
          categories={categoriesByUseCase}
        />
      </section>

      {/* autres sections */}
      <section className="py-16 bg-white">
        <CapabilitiesSection />
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-900 text-white mb-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            {t("pricing.ready_to_unlock_real_world_insights")}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {t(
              "pricing.join_companies_ngos_and_startups_across_africa_who_trust_tada_for_ground_truth"
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="" asChild>
              <Link href="/schedule-a-demo">{t("pricing.schedule_demo")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
