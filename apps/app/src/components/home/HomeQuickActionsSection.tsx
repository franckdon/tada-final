"use client";

import Link from "next/link";
import { Card } from "@tada/ui/components/card";
import { Badge } from "@tada/ui/components/badge";
import { Button } from "@tada/ui/components/button";
import { useScopedI18n } from "@/locales/client";
import { useCreditsPurchaseFlowStore } from "@/stores/useCreditsPurchaseFlowStore";

import { PlusCircle, Database, TrendingUp, ClipboardPlus } from "lucide-react";

type ActionCard = {
  key: "addCredits" | "chatWithData" | "marketBeat" | "addMission";
  href?: string;
  icon: React.ReactNode;
  badge?: "new" | "recommended";
  onClick?: () => void;
};

export function HomeQuickActionsSection() {
  const t = useScopedI18n("home.quickActions");
  const openCreditsModal = useCreditsPurchaseFlowStore(
    (s) => s.openCreditsModal,
  );

  const cards: ActionCard[] = [
    {
      key: "addCredits",
      icon: <PlusCircle className="h-5 w-5" />,
      badge: "recommended",
      onClick: () => openCreditsModal(),
    },
    {
      key: "chatWithData",
      href: "/#",
      icon: <Database className="h-5 w-5" />,
      badge: "new",
    },
    {
      key: "marketBeat",
      href: "/#",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      key: "addMission",
      href: "/create-mission",
      icon: <ClipboardPlus className="h-5 w-5" />,
    },
  ];

  return (
    <section className="bg-white rounded-xl p-6">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
          <p className="text-gray-500 mt-1">{t("subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => {
          const content = (
            <Card className="p-5 h-full border bg-white hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 text-gray-900">
                  <span className="inline-flex items-center justify-center rounded-md border bg-gray-50 h-10 w-10">
                    {c.icon}
                  </span>
                  <div className="font-semibold">{t(`${c.key}.title`)}</div>
                </div>
              </div>

              <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                {t(`${c.key}.desc`)}
              </p>
            </Card>
          );

          // card cliquable -> soit onClick (credits), soit Link
          if (c.onClick) {
            return (
              <button
                key={c.key}
                type="button"
                onClick={c.onClick}
                className="text-left group"
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={c.key} href={c.href ?? "#"} className="group">
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
