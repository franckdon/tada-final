"use client";

import { Star } from "lucide-react";
import { useI18n } from "../locales/client";
import { testimonials } from "@/constants";

export function TestimonialsSection() {
  const t = useI18n();

  return (
    <section className="py-12 bg-[#F0F1F3] lg:py-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#282828] mb-4 lg:mb-6">
            {t("common.testimonials.title")}
          </h2>
          <p className="text-base lg:text-lg font-light text-[#48505E]">
            {t("common.testimonials.subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-4 lg:p-6 rounded-2xl border border-[#B9BDC7]"
            >
              <div className="flex mb-3 lg:mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3 h-3 lg:w-4 lg:h-4 fill-[#FEC84B] text-[#FEC84B]"
                  />
                ))}
              </div>

              <p className="text-[#48505E] mb-4 lg:mb-6 text-sm leading-relaxed">
                {t(testimonial.text as any, {})}
              </p>

              <div className="flex items-center">
                <img
                  src={testimonial.thumbnail}
                  alt={testimonial.name}
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <div className="font-medium text-[#282828] text-sm lg:text-base">
                    {testimonial.name}
                  </div>
                  <div className="text-xs lg:text-sm font-light text-[#48505E]">
                    {t(testimonial.role as any, {})}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
