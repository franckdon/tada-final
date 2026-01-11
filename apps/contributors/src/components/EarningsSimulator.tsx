// components/EarningsSimulator.tsx
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface EarningsSimulatorProps {
  initialJobsPerWeek?: number;
  initialAvgPay?: number;
  currency?: string; // "£" or "$" etc.
  imageSrc?: string;
}

export function EarningsSimulator({
  initialJobsPerWeek = 6,
  initialAvgPay = 7,
  currency = "£",
  imageSrc = "/images/hero-person.jpg", // adapte ton image
}: EarningsSimulatorProps) {
  const [jobsPerWeek, setJobsPerWeek] = useState<number>(initialJobsPerWeek);
  const [avgPay, setAvgPay] = useState<number>(initialAvgPay);

  // Calcul : on multiplie par 4 semaines (ex: 6 * 7 * 4 = 168)
  const monthly = useMemo(() => Math.round(jobsPerWeek * avgPay * 4), [jobsPerWeek, avgPay]);

  const formatCurrency = (value: number) =>
    `${currency}${value.toLocaleString()}`;

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* LEFT: Text, amount, slider */}
          <div>
            <h3 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-2">
              Join <span className="text-emerald-500">Shepper</span>.
            </h3>
            <p className="text-3xl md:text-4xl font-semibold text-gray-800 mb-6">
              You could earn
            </p>

            <div className="flex items-baseline gap-4 mb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={monthly}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="text-5xl md:text-6xl font-extrabold text-gray-900"
                >
                  {formatCurrency(monthly)}
                </motion.div>
              </AnimatePresence>
              <span className="text-sm text-gray-500 mt-2">a month</span>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              <strong className="text-gray-700">{jobsPerWeek} jobs</strong> per week, job average{" "}
              <strong className="text-gray-700">{currency}{avgPay}</strong>
            </p>

            {/* Slider */}
            <div className="mb-6">
              <label htmlFor="jobs" className="sr-only">Jobs per week</label>
              <div className="relative">
                {/* Custom background line */}
                <div className="h-2 bg-black rounded-full" aria-hidden />
                <input
                  id="jobs"
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={jobsPerWeek}
                  onChange={(e) => setJobsPerWeek(Number(e.target.value))}
                  className="absolute inset-0 w-full h-2 appearance-none bg-transparent"
                  aria-label="Jobs per week"
                />
              </div>

              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>0</span>
                  <span className="w-6 h-6 rounded-full bg-emerald-500" />
                </div>
                <div>20</div>
              </div>
            </div>

            {/* Avg pay input */}
            <div className="flex items-center gap-4 mb-6">
              <label htmlFor="avgPay" className="text-sm text-gray-600">
                Average pay per job
              </label>
              <div className="flex items-center gap-2">
                <span className="text-lg">{currency}</span>
                <input
                  id="avgPay"
                  type="number"
                  min={0}
                  step={0.5}
                  value={avgPay}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isNaN(v)) setAvgPay(v);
                  }}
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            <a href="#" className="text-sm text-emerald-600 underline mb-6 inline-block">
              learn how we estimate your earnings
            </a>

            <div className="mt-6 flex items-center gap-4">
              {/* App store buttons (remplace par images réelles) */}
              <a href="#" className="inline-block">
                <Image src="/images/app-store-badge.png" alt="App Store" width={140} height={40} />
              </a>
              <a href="#" className="inline-block">
                <Image src="/images/play-store-badge.png" alt="Google Play" width={140} height={40} />
              </a>
            </div>
          </div>

          {/* RIGHT: Video / image + Trustpilot */}
          <div className="space-y-6">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <Image
                src={imageSrc}
                alt="Contributor example"
                width={720}
                height={540}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Trustpilot icons / rating (simplifié) */}
              <div className="flex items-center gap-1">
                {/* 5 stars using SVG inline for simple styling */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill={i < 4 ? "#16a34a" : "#e6e6e6"} xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 .587l3.668 7.431L24 9.748l-6 5.847 1.417 8.268L12 19.771 4.583 23.863 6 15.595 0 9.748l8.332-1.73L12 .587z" />
                  </svg>
                ))}
              </div>
              <div>
                <div className="text-sm font-medium">Trustpilot</div>
                <div className="text-xs text-gray-500">TrustScore 4.6 | 250 reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}