"use client";
import { useI18n } from "@/locales/client";
import React from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@tada/ui/components/button";

interface ZigZagItem {
  eyebrow?: string;
  title: string;
  description: string;
  image: string;
  buttonLabel: string;
  buttonLink: string;
}

interface ZigZagData {
  title?: string;
  items?: ZigZagItem[];
}

interface DynamicZigZagProps {
  data?: ZigZagData;
}

export default function DynamicZigZag({ data }: DynamicZigZagProps) {
  // ✅ Vérification de sécurité
  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    return null;
  }
  const t = useI18n();

  return (
    <section className="container-custom py-8 sm:py-16">
      {/* Section Header */}
      {data.title && t(data.title as any, {}) !== data.title && (
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t(data.title as any, {})}
          </h2>
        </div>
      )}

      <div className="flex flex-col gap-24">
        {data.items.map((item, index) => {
          const isReversed = index % 2 === 1;

          return (
            <div
              key={index}
              className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${
                isReversed ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Text Block */}
              <div className={isReversed ? "md:order-last" : undefined}>
                {item.eyebrow && t(item.eyebrow as any, {}) !== item.eyebrow && (
                  <span className="text-sm text-premise-blue font-semibold block mb-2">
                    {t(item.eyebrow as any, {})}
                  </span>
                )}

                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {t(item.title as any, {})}
                </h3>

                <div className="text-gray-600 text-lg leading-relaxed mb-6" dangerouslySetInnerHTML={{
                  __html: t(item.description as any, {}),
                }} />

                {item.buttonLabel && t(item.buttonLabel as any, {}) !== item.buttonLabel && (
                <Button asChild className="group inline-flex items-center">
                  <Link href={item.buttonLink || "#"}>
                    {t(item.buttonLabel as any, {})}
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                )}
              </div>

              {/* Image Block */}
              {/* <div className="relative w-full h-80 md:h-[360px] rounded-xl overflow-hidden shadow-sm bg-gray-50"> */}
              <div className="relative w-full h-80 md:h-[360px]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  // className="object-contain md:object-cover"
                  className="object-contain"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}