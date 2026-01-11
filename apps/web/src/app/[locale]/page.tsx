import { Features } from "@/components/features";
import { DefaultTestimonial } from "@/components/testimonials";
import Image from "next/image";
import Link from "next/link";
import { generateMetadata } from "./metadata";
import { getI18n } from "@/locales/server";
import { HeroSection } from "@/components/hero-section";
import { Button } from "@tada/ui/components/button";
import { ShoppingBag, Building2, TrendingUp, Briefcase } from "lucide-react";
import ScrollingTextHero from "@/components/ScrollingTextHero";
import DynamicTrustedBy from "@/components/solution-trusted-by";

export const metadata = generateMetadata({
  title: "Tada - Insight, Everywhere, Instantly",
  description:
    "Harness the power of data-driven intelligence and get actionable insights quickly and cost-effectively with Tada.",
});

export default async function Home() {
  const t = await getI18n();

  const features = [
    {
      name: t("home.insights_for_any_industry.stats.submissions"),
      description: t(
        "home.insights_for_any_industry.stats.submission_description"
      ),
      icon: ShoppingBag,
    },
    {
      name: t("home.insights_for_any_industry.stats.submissions_2"),
      description: t(
        "home.insights_for_any_industry.stats.submission_description_2"
      ),
      icon: Building2,
    },
    {
      name: t("home.insights_for_any_industry.stats.submissions_3"),
      description: t(
        "home.insights_for_any_industry.stats.submission_description_3"
      ),
      icon: TrendingUp,
    },
    {
      name: t("home.insights_for_any_industry.stats.submissions_4"),
      description: t(
        "home.insights_for_any_industry.stats.submission_description_4"
      ),
      icon: Briefcase,
    },
  ];
  return (
    <div className="flex flex-col px-4 md:px-16 space-y-16">
      {/* Hero Section */}
      <HeroSection />

      {/* Trusted By Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h3 className="text-2xl md:text-5xl font-bold text-center mb-10 block max-w-4xl mx-auto">
            {t("home.trusted_by.title")}
          </h3>
          <p className="text-center text-gray-600 mb-10 md:text-xl">
            {t("home.trusted_by.description")}
          </p>
          {/* <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <Image
              src="/images/cocacola.png"
              alt="Coca-Cola"
              width={120}
              height={60}
              className="h-12 w-auto"
            />
            <Image
              src="/images/pepsico.png"
              alt="PepsiCo"
              width={120}
              height={60}
              className="h-12 w-auto"
            />
            <Image
              src="/images/unicef.png"
              alt="UNICEF"
              width={120}
              height={60}
              className="h-12 w-auto"
            />
            <Image
              src="/images/mckinsey.png"
              alt="McKinsey"
              width={120}
              height={60}
              className="h-12 w-auto"
            />
            <Image
              src="/images/toyota.png"
              alt="Toyota"
              width={120}
              height={60}
              className="h-12 w-auto"
            />
            <Image
              src="/images/glovo.png"
              alt="Glovo"
              width={120}
              height={60}
              className="h-12 w-auto"
            />
            <Image
              src="/images/bcg-31.png"
              alt="BCG"
              width={120}
              height={60}
              className="h-12 w-auto"
            />
          </div> */}

          <DynamicTrustedBy />
        </div>
      </section>

      {/* Global Demand Section */}
      <section className="">
        <div className="container-custom px-4 py-12 sm:p-16 bg-gradient-to-r from-gray-400/90 to-gray-400/80 text-white">
          <h3 className="text-2xl md:text-5xl font-bold text-center mb-4">
            {t("home.global_demand.title")}
          </h3>
          <p className="text-center text-gray-50 max-w-6xl mx-auto mb-12 md:text-xl">
            {t("home.global_demand.description")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-md p-8 text-center text-navy">
              <h4 className="text-3xl md:text-4xl font-bold mb-2 text-black">
                {t("home.global_demand.stats.submissions")} <br />
                {t("home.global_demand.stats.subtitle")}
              </h4>
              <p className="text-gray-600">
                {t("home.global_demand.stats.submission_description")}
              </p>
            </div>
            <div className="bg-white rounded-md p-8 text-center text-navy">
              <h4 className="text-3xl md:text-4xl font-bold mb-2 text-black">
                {t("home.global_demand.stats.contributors")} <br />
                {t("home.global_demand.stats.subtitle_1")}
              </h4>
              <p className="text-gray-600">
                {t("home.global_demand.stats.contributors_description")} <br />
              </p>
            </div>
            <div className="bg-white rounded-md p-8 text-center text-navy">
              <h4 className="text-3xl md:text-4xl font-bold mb-2 text-black">
                {t("home.global_demand.stats.points_of_interest")} <br />
                {t("home.global_demand.stats.subtitle_2")}
              </h4>
              <p className="text-gray-600">
                {t("home.global_demand.stats.points_of_interest_description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom space-y-12">
          <div className="text-center">
            <h3 className="mt-2 text-2xl md:text-5xl font-bold mb-4 block max-w-4xl mx-auto">
              {t("home.insights_for_any_industry.title")}
            </h3>
            <p className="text-gray-600 max-w-6xl mx-auto md:text-xl">
              {t("home.insights_for_any_industry.description")}
            </p>
          </div>

          <div className="relative">
            <div className="mx-auto max-w-7xl">
              <img
                alt="App screenshot"
                src="/images/pexels-mikhail-nilov-9301249.jpg"
                width={2432}
                height={500}
                className="w-full max-h-[500px] rounded-xl shadow-2xl ring-1 ring-gray-900/10 object-cover"
              />

              <div aria-hidden="true" className="relative">
                <div className="absolute -inset-x-20 bottom-0 bg-linear-to-t from-white" />
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
            <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base/7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 lg:gap-y-16">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <feature.icon
                      aria-hidden="true"
                      className="absolute top-1 left-1 size-5 text-primary"
                    />
                    {feature.name}
                  </dt>{" "}
                  <dd className="inline">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* How Tada Works */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <Image
                src="./images/Tada.png"
                alt="How Tada Works"
                width={500}
                height={400}
                className="rounded-md"
              />
            </div>
            <div>
              <h3 className="text-4xl md:text-5xl font-bold mb-4">
                {t("home.how_tada_works.title")}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("home.how_tada_works.description")}
                <br />
                {t("home.how_tada_works.description_2")}
              </p>

              <Button className="" asChild>
                <Link
                  href="/how-tada-works"
                  className="text-primary font-medium flex items-center"
                >
                  {t("home.how_tada_works.button")}
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What Sets Tada Apart */}
      <Features />
      
      <section className="py-16 bg-white">
        <div className="container-custom p-0 sm:p-4">
          <h3 className="text-4xl md:text-5xl font-bold text-center mb-8 block max-w-4xl mx-auto">
            {t("home.testimonials.title")}
          </h3>
          <DefaultTestimonial />
        </div>
      </section>

      {/* autres sections */}
      <section className="py-16 bg-white">
        <ScrollingTextHero />
      </section>
      {/* autres sections */}
    </div>
  );
}
