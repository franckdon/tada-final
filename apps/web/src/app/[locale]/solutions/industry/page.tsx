import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { generateMetadata } from "../../metadata";
import SolutionsFilter from "@/components/solutions-filter";
import CapabilitiesSection from "@/components/capabilities/CapabilitiesSection";
import SolutionCard from "@/components/solution-card";
import { getI18n } from "@/locales/server";
import { Button } from "@tada/ui/components/button";
import {
  featuresByIndustry,
} from "@/components/solutions/data";

export const metadata = generateMetadata({
  title: "Solutions | Tada",
  description:
    "Discover Tada's data intelligence solutions that provide actionable insights for businesses and organizations across industries.",
});

const categoriesByUseCase = ["All", "FMCG", "Public", "Consultancies"];

export default async function SolutionsPage() {
  const t = await getI18n();
  return (
    <div className="flex flex-col">
      {/* Industry Solutions */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20 md:mb-24">
            <div className="col-span-1 block md:hidden h-full">
              <Image src="/images/byIndustry.jpg" width={450} height={320} alt="" className="w-full h-auto"/>
            </div>
            <div className="col-span-1 flex flex-col justify-center h-full">
              <div className="max-w-3xl">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-rational-bold leading-tight mb-6">
                  {t("solutions.industry.title" as any, {})}
                </h1>
                <p className="text-lg md:text-xl mb-8 ">
                  {t("solutions.industry.subtitle" as any, {})}
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
                    {t("solutions.industry.cta.title" as any, {})}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="col-span-1 hidden md:block h-full">
              <Image src="/images/byIndustry.jpg" width={450} height={320} alt="" className="w-full h-auto"/>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-rational-bold mb-8 text-center">
            {t("solutions.industry.title")}
          </h2>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuresByIndustry.map((feature) => {
                // 🔑 clé de traduction basée sur l’ID
                const translationKey = `solutions.featuresByIndustry.${feature.id}`;

                return (
                  <SolutionCard
                    key={feature.id}
                    title={t(`${translationKey}.title` as any, {})}
                    description={t(`${translationKey}.description` as any, {})}
                    image={feature.image}
                    link={feature.link}
                    solutionFamily= "industry"
                  />
                );
              })}
            </div>
          </div>
        </div>
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
