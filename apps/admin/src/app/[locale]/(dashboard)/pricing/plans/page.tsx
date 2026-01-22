import StatCard from "@/components/contributors/stat-card";
import { prisma } from "@/lib/prisma";
import { getI18n } from "@/locales/server";
import {
  Package,
  BadgeDollarSign,
  CalendarDays,
  Plus,
  ArrowDownWideNarrow,
} from "lucide-react";
import { PlansTable } from "@/components/pricing/plans/plans-table";
import { PricingPageHeader } from "@/components/pricing/pricing-page-header";
import { Card, CardContent } from "@tada/ui/components/card";
import { Button } from "@tada/ui/components/button";
import Link from "next/link";

export const metadata = { title: "Plans | Tada" };

export type PlanRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceCents: number;
  bulletsFr: string;
  bulletsEn: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

async function getPlansWithStats(): Promise<{
  plans: PlanRow[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    avgPriceCents: number;
    minPriceCents: number;
    maxPriceCents: number;
  };
}> {
  const plans = await prisma.plan.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      priceCents: true,
      bulletsFr: true,
      bulletsEn: true,
      sortOrder: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const total = plans.length;
  const active = plans.filter((p) => p.isActive).length;
  const inactive = total - active;

  const prices = plans.map((p) => p.priceCents);
  const avgPriceCents =
    total === 0 ? 0 : Math.round(prices.reduce((s, x) => s + x, 0) / total);
  const minPriceCents = total === 0 ? 0 : Math.min(...prices);
  const maxPriceCents = total === 0 ? 0 : Math.max(...prices);

  return {
    plans,
    stats: {
      total,
      active,
      inactive,
      avgPriceCents,
      minPriceCents,
      maxPriceCents,
    },
  };
}

export default async function PlansPage() {
  const t = await getI18n();
  const { plans, stats } = await getPlansWithStats();

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardContent className="p-6 space-y-5">
          <PricingPageHeader
            title="Plans"
            description="Gère les plans (nom, description, prix EUR, bullets FR/EN, ordre et activation)."
            right={
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/pricing/plans/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau plan
                </Link>
              </Button>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              {
                key: "total",
                label: "Total",
                value: stats.total,
                icon: <Package className="h-8 w-8 text-blue-600" />,
              },
              {
                key: "active",
                label: "Actifs",
                value: stats.active,
                icon: <CalendarDays className="h-8 w-8 text-green-600" />,
              },
            ].map((item) => (
              <StatCard key={item.key} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="min-h-screen p-3 bg-white">
        <PlansTable plans={plans} />
      </div>
    </div>
  );
}
