// src/app/[locale]/pricing/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@tada/ui/lib/utils";
import { Button } from "@tada/ui/components/button";

import {
  PLAN_LIMITS,
  formatLimit,
  type PlanCode,
} from "@/lib/plans/plan-limits";

type Locale = "fr" | "en";

function splitBullets(text: string | null | undefined) {
  return (text ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^\-\s*/, ""));
}

function isPlanCode(value: string): value is PlanCode {
  return (
    value === "starter" ||
    value === "growth" ||
    value === "business" ||
    value === "entreprise"
  );
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale = "fr" } = await params;

  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      bulletsFr: true,
      bulletsEn: true,
      sortOrder: true,
    },
  });

  const maxSortOrder = plans.reduce(
    (acc, p) => Math.max(acc, p.sortOrder ?? 0),
    0,
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {locale === "fr"
            ? "Choisissez le plan adapté à vos décisions."
            : "Choose the plan that fits your decisions."}
        </h1>
        <p className="text-sm text-gray-600">
          {locale === "fr"
            ? "Comparez nos offres et accédez aux fonctionnalités qui accélèrent vos études."
            : "Compare plans and access features that accelerate your research."}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const bullets = splitBullets(
            locale === "fr" ? plan.bulletsFr : plan.bulletsEn,
          );

          const isFeatured =
            plan.sortOrder === maxSortOrder ||
            plan.name.toLowerCase().includes("enterprise");

          const code: PlanCode = isPlanCode(plan.code) ? plan.code : "starter";

          const limits = PLAN_LIMITS[code];

          return (
            <PlanCard
              key={plan.id}
              plan={{
                name: plan.name,
                description: plan.description,
                respondentCompletesLabel: formatLimit(
                  limits.respondentCompletes,
                ),
                bullets,
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
    name: string;
    description: string | null;
    respondentCompletesLabel: string;
    bullets: string[];
  };
  featured: boolean;
  locale: Locale;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-white shadow-sm overflow-hidden",
        "flex flex-col min-h-[520px]",
        featured && "border-transparent",
      )}
    >
      {featured && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-orange-500 opacity-95" />
      )}

      <div
        className={cn(
          "relative p-7 flex flex-col flex-1",
          featured && "text-white",
        )}
      >
        {/* Title */}
        <h3 className="text-2xl font-bold">{plan.name}</h3>

        <p className="mt-2 text-sm opacity-90">{plan.description || "—"}</p>

        {/* Respondents */}
        <div className="mt-6">
          <div className="text-3xl font-bold">
            {plan.respondentCompletesLabel}
          </div>
          <div className="text-sm opacity-80">
            {locale === "fr"
              ? "Réponses (soumissions) incluses"
              : "Respondent completes included"}
          </div>
        </div>

        <div className="my-6 h-px bg-white/20" />

        {/* Bullets */}
        <ul className="space-y-3">
          {plan.bullets.map((b, i) => (
            <li key={i} className="flex gap-2 items-start">
              <Check className="h-4 w-4 mt-1" />
              <span className="text-sm">{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-7">
          <Button
            asChild
            className={cn(
              "w-full h-11 rounded-xl font-semibold",
              featured
                ? "bg-white text-indigo-700 hover:bg-white/90"
                : "bg-blue-600 hover:bg-blue-700 text-white",
            )}
          >
            <Link
              href="https://calendly.com/tadaiq/30min"
              target="_blank"
              rel="noreferrer"
            >
              {locale === "fr" ? "Contactez-nous" : "Talk to us"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
