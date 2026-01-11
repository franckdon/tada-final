"use client";
import { useI18n } from "@/locales/client";
import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@tada/ui/components/button";
import Link from "next/link";

interface CTAData {
  title: string;
  subtitle: string;
  primaryButton: string;
  secondaryButton: string;
  ctaPrimaryLink?: string;
  ctaSecondaryLink?: string;
}

interface DynamicCTAProps {
  data?: CTAData;
}

const DynamicCTA: React.FC<DynamicCTAProps> = ({ data }) => {
  const t = useI18n();
  
  if (!data) return null;

  return (
    <section className="py-16 sm:py-24 bg-primary text-white mb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">{t(data.title as any, {})}</h2>

        {data.subtitle && t(data.subtitle as any, {}) !== data.subtitle && (
        <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
          {t(data.subtitle as any, {})}
        </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {data.primaryButton && t(data.primaryButton as any, {}) !== data.primaryButton && (
          <Button
            variant="default"
            asChild
            className="flex items-center justify-center group bg-black hover:bg-secondary hover:text-primary"
          >
            <Link href={data.ctaPrimaryLink ?? "#"}>
              {t(data.primaryButton as any, {})}{" "}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          )}

          {data.secondaryButton && t(data.secondaryButton as any, {}) !== data.secondaryButton && (
            <Button
              variant="outline"
              asChild
              className="flex items-center justify-center group"
            >
              <Link href={data.ctaSecondaryLink ?? "#"} className="text-black">
                {t(data.secondaryButton as any, {})}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default DynamicCTA;
