"use client";

import Image from "next/image";
import { useI18n } from "../locales/client";

export function ThreeStepsSection() {
  const t = useI18n();

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-12 space-y-5 lg:mb-16">
          <div className="space-y-3 lg:mb-6 mb-4">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-semibold tracking-tight text-[#282828] leading-tight">
              {t("common.stepsTitle1")}
            </h2>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-semibold tracking-tight text-[#282828] leading-tight">
              {t("common.stepsTitle2")}
            </h2>
          </div>
          <p className="text-base font-normal lg:text-lg text-[#48505E] max-w-2xl mx-auto">
            {t("common.stepsDescription")}
          </p>
        </div>

        {/* Mobile: Stack vertically */}
        <div className="block lg:hidden space-y-0">
          {/* Step 1 */}
          <div className="bg-[#FFA200] text-white p-10">
            <h3 className="text-3xl font-bold mb-4">
              {t("common.step1Title")}
            </h3>
            <p className="text-base font-light opacity-90 leading-relaxed">
              {t("common.step1Description")}
            </p>
          </div>
          <div className="relative h-64">
            <Image
              src="/images/step-1.png"
              alt="Step 1"
              fill
              className="object-cover object-center"
            />
          </div>

          {/* Step 2 */}
          <div className="bg-[#00A576] p-10 text-white">
            <h3 className="text-3xl font-bold mb-4">
              {t("common.step2Title")}
            </h3>
            <p className="text-base font-light opacity-90 leading-relaxed">
              {t("common.step2Description")}
            </p>
          </div>
          <div className="relative h-64">
            <Image
              src="/images/step-2.png"
              alt="Step 2"
              fill
              className="object-cover object-center"
            />
          </div>

          {/* Step 3 */}
          <div className="bg-[#7F3AFF] p-10 text-white">
            <h3 className="text-3xl font-bold mb-4">
              {t("common.step3Title")}
            </h3>
            <p className="text-base font-light opacity-90 leading-relaxed">
              {t("common.step3Description")}
            </p>
          </div>
          <div className="relative h-64">
            <Image
              src="/images/step-3.png"
              alt="Step 3"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>

        {/* Desktop: Grid 2x3 */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-0">
          <div className="bg-[#FFA200] p-12 py-24 md:p-20 lg:p-24 text-white flex flex-col justify-center">
            <h3 className="text-5xl font-semibold mb-6">
              {t("common.step1Title")}
            </h3>
            <p className="text-base font-light opacity-90 leading-relaxed">
              {t("common.step1Description")}
            </p>
          </div>
          <div className="relative">
            <Image
              src="/images/step-1.png"
              alt="Step 1"
              fill
              className="object-cover object-center"
            />
          </div>

          <div className="relative">
            <Image
              src="/images/step-2.png"
              alt="Step 2"
              fill
              className="object-cover object-center"
            />
          </div>
          <div className="bg-[#00A576] p-12 py-24 md:p-20 lg:p-24 text-white flex flex-col justify-center">
            <h3 className="text-5xl font-semibold mb-6">
              {t("common.step2Title")}
            </h3>
            <p className="text-base font-light opacity-90 leading-relaxed">
              {t("common.step2Description")}
            </p>
          </div>

          <div className="bg-[#7F3AFF] p-12 py-24 md:p-20 lg:p-24 text-white flex flex-col justify-center">
            <h3 className="text-5xl font-semibold mb-6">
              {t("common.step3Title")}
            </h3>
            <p className="text-base font-light opacity-90 leading-relaxed">
              {t("common.step3Description")}
            </p>
          </div>
          <div className="relative">
            <Image
              src="/images/step-3.png"
              alt="Step 3"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
