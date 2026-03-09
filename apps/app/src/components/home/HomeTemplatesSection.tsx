"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@tada/ui/lib/utils";
import { useI18n } from "@/locales/client";

type TemplateItem = {
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

export function HomeTemplatesSection({
  title,
  items,
  className,
}: {
  title?: string;
  items?: TemplateItem[];
  className?: string;
}) {
  const t = useI18n();

  const defaultTemplates: TemplateItem[] = [
    {
      title: t("home.templates.items.brandHealth.title"),
      href: "#",
      imageSrc: "/images/templates/Track.webp",
      imageAlt: t("home.templates.items.brandHealth.imageAlt"),
    },
    {
      title: t("home.templates.items.campaignImpact.title"),
      href: "#",
      imageSrc: "/images/templates/Measure.webp",
      imageAlt: t("home.templates.items.campaignImpact.imageAlt"),
    },
    {
      title: t("home.templates.items.adMemorability.title"),
      href: "#",
      imageSrc: "/images/templates/Test_how.webp",
      imageAlt: t("home.templates.items.adMemorability.imageAlt"),
    },
    {
      title: t("home.templates.items.ideaTesting.title"),
      href: "#",
      imageSrc: "/images/templates/Test_new.webp",
      imageAlt: t("home.templates.items.ideaTesting.imageAlt"),
    },
    {
      title: t("home.templates.items.personas.title"),
      href: "#",
      imageSrc: "/images/templates/Understand.webp",
      imageAlt: t("home.templates.items.personas.imageAlt"),
    },
    {
      title: t("home.templates.items.usageAttitudes.title"),
      href: "#",
      imageSrc: "/images/templates/Learn_how.webp",
      imageAlt: t("home.templates.items.usageAttitudes.imageAlt"),
    },
  ];

  const finalTitle = title ?? t("home.templates.title");
  const finalItems = items ?? defaultTemplates;

  return (
    <section className={cn("mt-8", "p-6", className)}>
      <h2 className="mb-3 text-lg font-semibold text-gray-900">{finalTitle}</h2>

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
          {finalItems.map((it, index) => (
            <Link
              key={`${it.title}-${index}`}
              href={it.href}
              className="group border-b p-6 transition-colors hover:bg-gray-50 sm:border-b lg:border-b-0 lg:border-r last:border-r-0"
            >
              <div className="flex flex-col gap-4">
                <div className="relative h-20 w-full">
                  <Image
                    src={it.imageSrc}
                    alt={it.imageAlt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 50vw, 16vw"
                    priority={false}
                  />
                </div>

                <div className="text-sm font-semibold leading-snug text-gray-900 group-hover:underline">
                  {it.title}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
