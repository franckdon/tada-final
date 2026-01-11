"use client";

import Image from "next/image";
import { useI18n } from "../locales/client";
import DynamicTrustedBy from "@/components/trusted-by";

export function PartnersSection() {
  const t = useI18n();

  return (
    <section className="py-10 lg:py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <h2 className="text-center text-gray-600 text-base lg:text-lg mb-6 lg:mb-8">
          {t("common.partnersTitle")}
        </h2>

        <DynamicTrustedBy />
        
      </div>
    </section>
  );
}
