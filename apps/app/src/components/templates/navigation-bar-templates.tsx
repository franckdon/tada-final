"use client";

import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { cn } from "@tada/ui/lib/utils";
import { DatabaseIcon, Globe, Plus } from "lucide-react";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { CreateTemplateModal } from "./modals/create-template-modal";
import { createTemplateAction } from "@/actions/templates/create-template-action";
import { useAction } from "next-safe-action/hooks";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";

export function NavigationBarTemplates({ orgId }: { orgId: string }) {
  const t = useI18n();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isCreationViaTemplate = mode === "template";

  const [currentTab, setCurrentTab] = useQueryState("tab", {
    shallow: false,
    defaultValue: "internal",
  });

  const createTemplate = useAction(createTemplateAction, {
    onSuccess: () => {
      setIsOpen(false);
      toast({
        title: t("missions.templates.success"),
      });
    },
    onError: () => {
      setIsOpen(false);
      toast({
        title: t("missions.templates.error"),
        variant: "destructive",
      });
    },
  });

  const navItems = [
    {
      id: "internal",
      label: t("missions.templates.navigation.internal"),
      icon: <DatabaseIcon className="w-5 h-5" />,
    },
    {
      id: "external",
      label: t("missions.templates.navigation.external"),
      icon: <Globe className="w-5 h-5" />,
    },
  ];

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          {isCreationViaTemplate
            ? t("missions.templates.chooseTemplate")
            : t("missions.templates.title")}
        </h1>

        {!isCreationViaTemplate && (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsOpen(true)}
          >
            <Plus className="w-5 h-5" />
            {t("missions.templates.createTemplate")}
          </Button>
        )}
      </div>

      <div className="flex mt-4 justify-start px-8">
        {navItems.map((tab) => (
          <button
            onClick={() => setCurrentTab(tab.id)}
            key={tab.id}
            type="button"
            className={cn(
              "flex items-center text-sm transition-colors px-4 py-2 rounded-sm ",
              "dark:bg-[#1D1D1D] dark:text-[#878787]",
              "bg-white text-gray-600 dark:text-white",
              currentTab === tab.id && "text-white dark:bg-[#2C2C2C] bg-primary"
            )}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      {!isCreationViaTemplate && (
        <CreateTemplateModal
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          isLoading={createTemplate.status === "executing"}
          createTemplate={({ name, type }: { name: string; type: string }) =>
            createTemplate.execute({
              name,
              type,
              organizationId: orgId,
            })
          }
        />
      )}
    </div>
  );
}
