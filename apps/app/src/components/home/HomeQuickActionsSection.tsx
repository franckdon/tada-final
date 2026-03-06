"use client";

import Link from "next/link";
import { Card } from "@tada/ui/components/card";
import { useScopedI18n, useCurrentLocale } from "@/locales/client";
import { useCreditsPurchaseFlowStore } from "@/stores/useCreditsPurchaseFlowStore";
import { useWorkspace } from "@/context/workspace-context";
import { usePathname } from "next/navigation";

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
  const currentLocale = useCurrentLocale();
  const pathname = usePathname();
  const { currentWorkspace } = useWorkspace();

  const openCreditsModal = useCreditsPurchaseFlowStore(
    (s) => s.openCreditsModal,
  );

  const parts = pathname.split("/");
  let workspaceIdFromUrl: string | undefined;

  if (
    parts.length > 3 &&
    (parts[2] === "missions" || parts[2] === "market-beats")
  ) {
    workspaceIdFromUrl = parts[3];
  }

  const workspaceId =
    currentWorkspace?.id || workspaceIdFromUrl || "dev-workspace";

  const cards: ActionCard[] = [
    {
      key: "addCredits",
      icon: <PlusCircle className="h-5 w-5" />,
      badge: "recommended",
      onClick: () => openCreditsModal(),
    },
    {
      key: "addMission",
      href: `/${currentLocale}/missions/${workspaceId}`,
      icon: <ClipboardPlus className="h-5 w-5" />,
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
  ];

  return (
    <section className="rounded-xl bg-white p-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
          <p className="mt-1 text-gray-500">{t("subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const content = (
            <Card className="h-full border bg-white p-5 transition hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 text-gray-900">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border bg-gray-50">
                    {c.icon}
                  </span>
                  <div className="font-semibold">{t(`${c.key}.title`)}</div>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {t(`${c.key}.desc`)}
              </p>
            </Card>
          );

          if (c.onClick) {
            return (
              <button
                key={c.key}
                type="button"
                onClick={c.onClick}
                className="group text-left"
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
