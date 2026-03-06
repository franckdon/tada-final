import Image from "next/image";
import Link from "next/link";
import { cn } from "@tada/ui/lib/utils";

type TemplateItem = {
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

const DEFAULT_TEMPLATES: TemplateItem[] = [
  {
    title: "Track your brand’s health",
    href: "#",
    imageSrc: "/images/templates/Track.webp",
    imageAlt: "Brand health template",
  },
  {
    title: "Measure the impact of your campaigns",
    href: "#",
    imageSrc: "/images/templates/Measure.webp",
    imageAlt: "Campaign impact template",
  },
  {
    title: "Test how memorable your campaign is",
    href: "#",
    imageSrc: "/images/templates/Test_how.webp",
    imageAlt: "Ad memorability template",
  },
  {
    title: "Test new ideas before you launch",
    href: "#",
    imageSrc: "/images/templates/Test_new.webp",
    imageAlt: "Idea testing template",
  },
  {
    title: "Understand who your customers really are",
    href: "#",
    imageSrc: "/images/templates/Understand.webp",
    imageAlt: "Personas template",
  },
  {
    title: "Learn how and why people use your category",
    href: "#",
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
      <h2 className="mb-3 text-lg font-semibold text-gray-900">{title}</h2>

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
          {items.map((it, index) => (
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
