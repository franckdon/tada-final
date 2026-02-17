import Image from "next/image";
import { Button } from "@tada/ui/components/button";
import { cn } from "@tada/ui/lib/utils";
import { Calendar } from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

type Chip = { label: string };

const DEFAULT_CHIPS: Chip[] = [
  { label: "Take a tour of the platform" },
  { label: "Schedule a strategic session" },
  { label: "Begin a new project" },
];

export function HomeScheduleCallSection({
  title = "Schedule a call with our team anytime for quick and efficient support.",
  ctaLabel = "Book a Demo",
  ctaHref = appUrl
    ? `${appUrl}/support`
    : "https://calendly.com/tada-demo/30min",
  chips = DEFAULT_CHIPS,
  className,
}: {
  title?: string;
  ctaLabel?: string;
  ctaHref?: string;
  chips?: Chip[];
  className?: string;
}) {
  return (
    <section className={cn("mt-8", "p-6", className)}>
      <div className="relative overflow-hidden rounded-xl border bg-gray-50">
        {/* Fond map (optionnel) */}
        <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 opacity-30 hidden md:block">
          <Image
            src="/images/world-dots.png"
            alt="World map"
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
                {title}
              </div>

              <div className="flex flex-wrap gap-2">
                {chips.map((c, idx) => (
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
                {ctaLabel}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
