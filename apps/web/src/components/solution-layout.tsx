
"use client";

import React from "react";
import { Solution } from "./solutions/data";
import DynamicHero from "./solutions/dynamic-hero";
import DynamicTrustedBy from "@/components/solution-trusted-by";
import DynamicFeatures from "./solutions/dynamic-features";
import DynamicZigZag from "./solutions/dynamic-zig-zag";
/* import DynamicHowItWorks from "./solutions/dynamic-how-it-works"; */
import DynamicUseCases from "./solutions/dynamic-use-cases";
/* import DynamicTestimonials from "./solutions/dynamic-testimonials"; */
import DynamicQuestions from "./solutions/dynamic-questions";
import DynamicMore from "./solutions/dynamic-more";
import DynamicCTA from "./solutions/dynamic-cta";
import DynamicAccordion from "./solutions/dynamic-accordion";
import { strict } from "assert";
import { useI18n } from "@/locales/client";

interface SolutionLayoutProps {
  solution: Solution;
  family?: string;
}

const SolutionLayout: React.FC<SolutionLayoutProps> = ({ solution, family }) => {
  const t = useI18n();
  
  return (
    <div className="min-h-screen bg-white space-y-16">
      <DynamicHero data={solution.hero} />
      <div className="container-custom pb-16 bg-white overflow-hidden mb-20 md:mb-24">
        <div className="text-center">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-6">
            {t("solutions.trustedBy.layout" as any, {})
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
      <DynamicFeatures data={solution.features} />
      {/*  <DynamicHowItWorks data={solution.howItWorks} /> */}
      <DynamicZigZag data={solution.zigZag} />
      <DynamicUseCases data={solution.useCases} />
      {/*  <DynamicTestimonials data={solution.testimonials} /> */}
      <DynamicQuestions data={solution.questions} />
      <DynamicAccordion data={solution.accordion} />
      <DynamicMore title={solution.title} category={solution.category} industry={solution.industry} family={family} />
      <DynamicCTA data={solution.cta} />
    </div>
  );
};

export default SolutionLayout;
