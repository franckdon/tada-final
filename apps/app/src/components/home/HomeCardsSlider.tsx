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

export function HomeCardsSlider({
  slides,
  title = "What's New",
}: {
  slides: Slide[];
  title?: string;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollByCards = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;

    const delta = el.clientWidth;

    el.scrollBy({
      left: dir === "left" ? -delta : delta,
      behavior: "smooth",
    });
  };

  if (!slides.length) {
    return null;
  }

  return (
    <section className="rounded-xl bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollByCards("left")}
            className="h-9 w-9 rounded-full border bg-white hover:bg-gray-50"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollByCards("right")}
            className="h-9 w-9 rounded-full border bg-white hover:bg-gray-50"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {slides.map((s, idx) => (
          <article
            key={idx}
            data-card
            className="w-full shrink-0 snap-start rounded-xl border bg-white p-5 sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
          >
            <div className="space-y-4">
              <div className="relative h-[180px] w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={s.imageSrc}
                  alt={s.imageAlt}
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-base font-bold text-gray-900 md:text-lg">
                {s.title}
              </h3>

              <p className="text-sm text-gray-600 md:text-base">
                {s.description}
              </p>

              {s.ctaHref && s.ctaLabel ? (
                <Button asChild className="text-white">
                  <Link href={s.ctaHref}>{s.ctaLabel}</Link>
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
