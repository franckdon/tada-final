"use client";

import { capitalizeFirstLetter, timeAgo } from "@/lib/utils";
import { useCurrentLocale, useI18n } from "@/locales/client";
import Link from "next/link";
import type { Template } from "./type";
import { TemplateStatus } from "./template-status";
import { Survey } from "@/context/surveys-builder-context";
import { useSearchParams } from "next/navigation";

interface TemplateCardProps {
  template: Template;
  orgId: string;
}

export function TemplateCard({ template, orgId }: TemplateCardProps) {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const navigateUrl =
    mode === "template"
      ? `/missions/${orgId}/create?t=${template.id}`
      : `/missions/${orgId}/templates/${template.id}`;

  return (
    <Link href={navigateUrl} className="grid grid-cols-4 py-6 px-4 gap-4">
      <div className="flex flex-col">
        <h2 className="font-medium text-gray-800 dark:text-gray-100">
          {template.name}
        </h2>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center">
          <span className="inline-block px-2 py-0.5 mt-2 text-xs text-white rounded-sm w-fit bg-blue-400">
            {capitalizeFirstLetter(template.type || "")}
          </span>
        </div>
        <span className="text-xs text-gray-400 mt-2 dark:text-gray-100">
          {t("templates.questions", {
            count:
              (template.questions as unknown as Survey)?.pages[0]?.elements
                .length || 0,
          })}
        </span>
      </div>

      <div className="flex flex-col">
        {template.status && <TemplateStatus template={template} />}
      </div>

      <div className="flex flex-col">
        <span className="text-base">{t("templates.lastUpdate")}</span>
        {template.updatedAt && (
          <span className="text-xs text-gray-400 mt-2 dark:text-gray-100">
            {timeAgo(new Date(template.updatedAt), currentLocale)}
          </span>
        )}
      </div>
    </Link>
  );
}
