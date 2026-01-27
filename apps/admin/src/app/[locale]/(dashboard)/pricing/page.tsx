import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@tada/ui/lib/utils";
import { Button } from "@tada/ui/components/button";

type Locale = "fr" | "en";

function splitBullets(text: string) {
  return (text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^\-\s*/, ""));
}

function formatPriceLabel(priceCents: number, locale: Locale) {
  if (!priceCents || priceCents <= 0) return "Custom";
  return new Intl.NumberFormat(locale === "fr" ? "en-US" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}

export default async function PricingPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const locale = (params?.locale ?? "fr") as Locale;

  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
      bulletsFr: true,
      bulletsEn: true,
      sortOrder: true,
      isActive: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Choisissez le plan adapté à vos décisions.
        </h1>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const bullets = splitBullets(
            locale === "fr" ? plan.bulletsFr : plan.bulletsEn,
          );

          // Option: on “highlight” le dernier (ou celui dont le name match Enterprise)
          const isFeatured =
            plan.name.toLowerCase().includes("enterprise") ||
            plan.sortOrder === Math.max(...plans.map((p) => p.sortOrder));

          return (
            <PlanCard
              key={plan.id}
              plan={{
                ...plan,
                bullets,
                priceLabel: formatPriceLabel(plan.priceCents, locale),
              }}
              featured={isFeatured}
              locale={locale}
            />
          );
        })}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  featured,
  locale,
}: {
  plan: {
    id: string;
    name: string;
    description: string | null;
    priceLabel: string;
    bullets: string[];
  };
  featured: boolean;
  locale: "fr" | "en";
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-white shadow-sm overflow-hidden",
        "flex flex-col min-h-[520px]",
        featured && "border-transparent",
      )}
    >
      {/* Background for featured */}
      {featured ? (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-orange-500 opacity-95" />
      ) : null}

      {/* Content wrapper */}
      <div
        className={cn(
          "relative p-7 flex flex-col flex-1",
          featured && "text-white",
        )}
      >
        {/* Title */}
        <div className="space-y-2">
          <h3
            className={cn(
              "text-2xl font-bold",
              featured ? "text-white" : "text-gray-900",
            )}
          >
            {plan.name}
          </h3>

          <p
            className={cn(
              "text-sm leading-relaxed",
              featured ? "text-white/90" : "text-gray-600",
            )}
          >
            {plan.description || (locale === "fr" ? "—" : "—")}
          </p>
        </div>

        {/* Price (tu peux masquer si tu veux “Contactez-nous” only) */}
        <div className="mt-6">
          <div
            className={cn(
              "text-3xl font-bold",
              featured ? "text-white" : "text-gray-900",
            )}
          >
            {plan.priceLabel}
          </div>
          <div
            className={cn(
              "text-sm mt-1",
              featured ? "text-white/80" : "text-gray-500",
            )}
          >
            {locale === "fr" ? "Prix indicatif" : "Indicative price"}
          </div>
        </div>

        {/* Divider */}
        <div
          className={cn("my-6 h-px", featured ? "bg-white/20" : "bg-gray-200")}
        />

        {/* Bullets */}
        <div className="space-y-3">
          <div
            className={cn(
              "text-sm font-semibold",
              featured ? "text-white/95" : "text-gray-800",
            )}
          >
            {locale === "fr" ? "Inclus dans ce plan" : "Included in this plan"}
          </div>

          <ul className="space-y-3">
            {plan.bullets.length ? (
              plan.bullets.map((b, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full",
                      featured ? "bg-white/20" : "bg-gray-100",
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        featured ? "text-white" : "text-gray-700",
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "text-sm leading-relaxed",
                      featured ? "text-white/90" : "text-gray-700",
                    )}
                  >
                    {b}
                  </span>
                </li>
              ))
            ) : (
              <li
                className={cn(
                  "text-sm",
                  featured ? "text-white/80" : "text-gray-500",
                )}
              >
                {locale === "fr"
                  ? "Aucun bullet renseigné."
                  : "No bullets provided."}
              </li>
            )}
          </ul>
        </div>

        {/* Spacer pushes footer CTA to bottom */}
        <div className="mt-auto" />

        {/* Footer CTA */}
        <div className={cn("pt-7", featured ? "" : "")}>
          <Button
            asChild
            className={cn(
              "w-full h-11 rounded-xl font-semibold",
              featured
                ? "bg-white text-indigo-700 hover:bg-white/90"
                : "bg-blue-600 hover:bg-blue-700 text-white",
            )}
          >
            <Link href="/contact">
              {locale === "fr" ? "Contactez-nous" : "Contact us"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
