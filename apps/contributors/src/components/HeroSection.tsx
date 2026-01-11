"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "../locales/client";

export function HeroSection() {
  const t = useI18n();

  return (
    <section className="overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-6 lg:pt-10">
        <div className="grid gap-8 lg:gap-12 relative items-center lg:grid-cols-[55%_45%]">
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            <div className="lg:space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-semibold text-[#282828]">
                {t("common.heroTitle1")}
              </h1>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-semibold text-[#282828]">
                {t("common.heroTitle2")}
              </h1>
            </div>
            <p className="text-base lg:text-lg text-[#48505E] font-normal max-w-lg mx-auto lg:mx-0">
              {t("common.heroDescription")}
            </p>
            <div className="flex flex-row gap-3 lg:gap-4 justify-center lg:justify-start">
              <Link
                href="https://testflight.apple.com/join/NU6pMECN"
                target="_blank"
              >
                <Image
                  src="/icons/apple.svg"
                  alt={t("common.downloadApple")}
                  height={40}
                  width={135}
                />
              </Link>
              <Link
                href="https://play.google.com/store/apps/details?id=com.tada-contributors.app"
                target="_blank"
              >
                <Image
                  src="/icons/android.svg"
                  alt={t("common.downloadAndroid")}
                  height={40}
                  width={150}
                />
              </Link>
            </div>
          </div>
          <div className="relative w-full mx-auto">
            <div
              className="absolute inset-0 bottom-0 bg-[#FF5B4A] rounded-t-3xl transform scale-x-75"
              style={{ marginTop: "180px" }}
            ></div>
            <div className="z-10">
              <Image
                src="/images/hero-man.png"
                alt={t("common.heroImageAlt")}
                width={1000}
                height={1}
                className="w-full h-auto relative z-10"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
