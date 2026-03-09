"use client";

import Image from "next/image";
import { Button } from "@tada/ui/components/button";
import { cn } from "@tada/ui/lib/utils";
import { Calendar } from "lucide-react";
import { useI18n } from "@/locales/client";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

type Chip = { label: string };

export function HomeScheduleCallSection({
  title,
  ctaLabel,
  ctaHref = appUrl
    ? `${appUrl}/support`
    : "https://calendly.com/tada-demo/30min",
  chips,
  className,
}: {
  title?: string;
  ctaLabel?: string;
  ctaHref?: string;
  chips?: Chip[];
  className?: string;
}) {
  const t = useI18n();

  const defaultChips: Chip[] = [
    { label: t("home.scheduleCall.chips.platformTour") },
    { label: t("home.scheduleCall.chips.strategicSession") },
    { label: t("home.scheduleCall.chips.newProject") },
  ];

  const finalTitle = title ?? t("home.scheduleCall.title");
  const finalCtaLabel = ctaLabel ?? t("home.scheduleCall.ctaLabel");
  const finalChips = chips ?? defaultChips;

  return (
    <section className={cn("mt-8", "p-6", className)}>
      <div className="relative overflow-hidden rounded-xl border bg-gray-50">
        <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 opacity-30 hidden md:block">
          <Image
            src="/images/world-dots.png"
            alt={t("home.scheduleCall.worldMapAlt")}
            width={360}
            height={160}
            className="object-contain"
          />
        </div>

        <div className="p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-white border flex items-center justify-center">
              <Calendar className="h-5 w-5 text-gray-700" />
            </div>

            <div className="space-y-3">
              <div className="text-base md:text-lg font-semibold text-gray-900">
                {finalTitle}
              </div>

              <div className="flex flex-wrap gap-2">
                {finalChips.map((c, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 rounded-full bg-white border px-3 py-1 text-xs text-gray-700"
                  >
                    <span className="text-emerald-600">✓</span>
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="md:shrink-0">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <a href={ctaHref} target="_blank" rel="noreferrer">
                <Calendar className="h-4 w-4 mr-2" />
                {finalCtaLabel}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
