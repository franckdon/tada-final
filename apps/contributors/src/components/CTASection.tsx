"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "../locales/client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CTASection() {
  const t = useI18n();

  // --- Simulateur ---
  const [jobsPerWeek, setJobsPerWeek] = useState(6);
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  const mensualValue = jobsPerWeek * 7 * 4; // $7 par job, 4 semaines

  // Animation du décompte
  useEffect(() => {
    const start = previousValue.current;
    const end = mensualValue;
    const duration = 600;
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(start + (end - start) * progress);
      setDisplayValue(value);
      if (progress < 1) requestAnimationFrame(animate);
      else previousValue.current = end;
    };

    requestAnimationFrame(animate);
  }, [mensualValue]);

  return (
    <section className="pt-4 lg:pt-6">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8 lg:gap-12 items-center">
          
          {/* Text Block */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left py-10">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl text-left sm:text-center font-semibold text-[#282828]">
                {t("common.ctaTitle")}
              </h2>
            </div>

            {/* -------------------------------- */}
            {/* SIMULATEUR DE GAINS */}
            {/* -------------------------------- */}
            <div className="mt-4 lg:mt-6">
              <div className="flex items-baseline justify-center gap-3 mb-4">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={displayValue}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="text-5xl lg:text-6xl font-bold text-primary"
                  >
                    ${displayValue}
                  </motion.span>
                </AnimatePresence>

                <span className="text-sm text-gray-500 mt-2">
                  / {t("common.ctaSimulator.month")}
                </span>
              </div>

              <p className="text-sm text-gray-600 text-center mb-4">
                <strong className="text-primary">{jobsPerWeek} jobs</strong>{" "}
                {t("common.ctaSimulator.perWeekFixed")}
              </p>

              {/* Slider */}
              <div className="w-full md:max-w-2xl mx-auto lg:mx-0">
                <div className="relative">
                  <div className="h-2 bg-gray-950 rounded-full" />
                  <input
                    type="range"
                    min={0}
                    max={20}
                    step={1}
                    value={jobsPerWeek}
                    onChange={(e) => setJobsPerWeek(Number(e.target.value))}
                    className="absolute inset-0 w-full h-2 appearance-none bg-transparent cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-6
                    [&::-webkit-slider-thumb]:h-6
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-primary"
                  />
                </div>
              </div>
            </div>
            {/* -------------------------------- */}

            <p className="text-base font-light lg:text-lg text-gray-600 text-center">
              {t("common.ctaDescription")}
            </p>

            <div className="flex flex-row gap-3 lg:gap-4 justify-center">
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

          {/* Image Block */}
          <div className="w-full max-w-xs sm:max-w-sm mx-auto px-4 lg:px-0">
            <Image
              src="/images/mobile-app.png"
              alt="Tada Mobile App"
              width={600}
              height={400}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}