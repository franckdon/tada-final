import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateMetadata } from "../metadata";
import { getI18n } from "@/locales/server";
import { DefaultTestimonial } from "@/components/testimonials";
import PricingSection from "@/components/pricing-section";
import FeaturesPricingSection from "@/components/features-pricing-section";
import FaqSection from "@/components/faq-section";
import BenefitsSection from "@/components/benefits-section";
import Link from "next/link";

export const metadata = generateMetadata({
  title: "Pricing | Tada",
  description:
    "Tada pricing is designed to be affordable and scalable for organizations of all sizes.",
});

export default async function ScheduleDemoPage() {
  const t = await getI18n();
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-teal-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t("pricing.title")}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t("pricing.description")}
          </p>
        </div>
      </section>
      <PricingSection />

      {/* Alternative Option */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("pricing.or")}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t("pricing.or_description")}
          </p>

          <Button asChild>
            <Link href="https://tada-client.vercel.app/login" target="_blank">
              {t("pricing.sign_up_for_free")}
            </Link>
          </Button>
        </div>
      </section>

      <FeaturesPricingSection />
      <FaqSection />
      <BenefitsSection />
      <section className="py-16 bg-white">
        <div className="container-custom ">
          <h2 className="text-2xl md:text-3xl font-bold  text-center mb-8">
            {t("home.testimonials.title")}
          </h2>
          <DefaultTestimonial />
        </div>
      </section>
      {/* Final CTA */}
      <section className="py-20 px-4 bg-gray-900 text-white">
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
