"use client";

import { useI18n } from "@/locales/client";
import { cn } from "@tada/ui/lib/utils";
import { Button } from "@tada/ui/components/button";
import { Settings2, Users, CreditCard } from "lucide-react";

export type WorkspaceSettingsTab = "general" | "members" | "billing";

interface WorkspaceSettingsMenuProps {
  active: WorkspaceSettingsTab;
  onChange: (tab: WorkspaceSettingsTab) => void;
}

export function WorkspaceSettingsMenu({
  active,
  onChange,
}: WorkspaceSettingsMenuProps) {
  const t = useI18n();

  const items: {
    id: WorkspaceSettingsTab;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "general",
      label: t("workspace.settings.menu.generalTitle") || "Workspace settings",
      description:
        t("workspace.settings.menu.generalSubtitle") || "Name, slug & deletion",
      icon: <Settings2 className="h-4 w-4" />,
    },
    {
      id: "members",
      label:
        t("workspace.settings.menu.membersTitle") || "Members & invitations",
      description:
        t("workspace.settings.menu.membersSubtitle") ||
        "Manage roles and access",
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "billing",
      label: t("workspace.settings.menu.billingTitle") || "Billing & credits",
      description:
        t("workspace.settings.menu.billingSubtitle") ||
        "Invoices & usage (coming soon)",
      icon: <CreditCard className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <Button
            key={item.id}
            type="button"
            variant="ghost"
            className={cn(
              "w-full justify-start px-4 py-3 h-auto rounded-xl border text-left bg-white dark:bg-gray-900",
              "border-gray-200 dark:border-gray-800 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/30",
              isActive &&
                "border-emerald-500/70 bg-emerald-50/80 dark:bg-emerald-900/40"
            )}
            onClick={() => onChange(item.id)}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border",
                  isActive
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                )}
              >
                {item.icon}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {item.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.description}
                </div>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
