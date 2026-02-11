"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@tada/ui/components/button";

type Slide = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageSrc: string;
  imageAlt: string;
};

export function HomeCardsSlider({ slides }: { slides: Slide[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollByCards = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;

    // scroll ~ 1 card (adaptable)
    const cardWidth =
      el.querySelector<HTMLElement>("[data-card]")?.offsetWidth ?? 360;
    const gap = 16;
    const delta = cardWidth + gap;

    el.scrollBy({ left: dir === "left" ? -delta : delta, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Controls */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">What's New</h2>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollByCards("left")}
            className="h-9 w-9 rounded-full border bg-white hover:bg-gray-50"
            aria-label="Scroll left"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollByCards("right")}
            className="h-9 w-9 rounded-full border bg-white hover:bg-gray-50"
            aria-label="Scroll right"
          >
            →
          </button>
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
        style={{
          scrollbarWidth: "none",
        }}
      >
        {/* hide scrollbar (webkit) */}
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {slides.map((s, idx) => (
          <article
            key={idx}
            data-card
            className="snap-start shrink-0 w-[320px] md:w-[420px] lg:w-[520px] rounded-xl border bg-white p-5"
          >
            <div className="space-y-4">
              <div className="relative h-[180px] w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={s.imageSrc}
                  alt={s.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 320px, 520px"
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-base md:text-lg font-bold text-gray-900">
                  {s.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  {s.description}
                </p>
              </div>

              {s.ctaHref && s.ctaLabel ? (
                <Button className="text-white">
                  <Link href={s.ctaHref} target="_blank">
                    {s.ctaLabel}
                  </Link>
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
