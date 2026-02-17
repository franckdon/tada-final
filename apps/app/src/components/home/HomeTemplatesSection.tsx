import Image from "next/image";
import Link from "next/link";
import { cn } from "@tada/ui/lib/utils";

type TemplateItem = {
  title: string;
  href: string;
  imageSrc: string; // local: /images/templates/xxx.png
  imageAlt: string;
};

const DEFAULT_TEMPLATES: TemplateItem[] = [
  {
    title: "Track your brand’s health",
    href: "/templates/brand-health",
    imageSrc: "/images/templates/Track.webp",
    imageAlt: "Brand health template",
  },
  {
    title: "Measure the impact of your campaigns",
    href: "/templates/campaign-impact",
    imageSrc: "/images/templates/Measure.webp",
    imageAlt: "Campaign impact template",
  },
  {
    title: "Test how memorable your campaign is",
    href: "/templates/ad-memorability",
    imageSrc: "/images/templates/Test_how.webp",
    imageAlt: "Ad memorability template",
  },
  {
    title: "Test new ideas before you launch",
    href: "/templates/idea-testing",
    imageSrc: "/images/templates/Test_new.webp",
    imageAlt: "Idea testing template",
  },
  {
    title: "Understand who your customers really are",
    href: "/templates/personas",
    imageSrc: "/images/templates/Understand.webp",
    imageAlt: "Personas template",
  },
  {
    title: "Learn how and why people use your category",
    href: "/templates/usage-and-attitudes",
    imageSrc: "/images/templates/Learn_how.webp",
    imageAlt: "Usage & attitudes template",
  },
];

export function HomeTemplatesSection({
  title = "Templates",
  items = DEFAULT_TEMPLATES,
  className,
}: {
  title?: string;
  items?: TemplateItem[];
  className?: string;
}) {
  return (
    <section className={cn("mt-8", "p-6", className)}>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>

      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="group p-6 border-b sm:border-b lg:border-b-0 lg:border-r last:border-r-0 hover:bg-gray-50 transition-colors"
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

                <div className="text-sm font-semibold text-gray-900 leading-snug group-hover:underline">
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
