"use client";

import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  hasFilters?: boolean;
};

export function NoResults({ hasFilters }: Props) {
  const router = useRouter();
  const t = useI18n();

  return (
    <div className="h-[calc(100vh-300px)] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <X className="mb-4" />
        <div className="text-center mb-6 space-y-2">
          <h2 className="font-medium text-lg">{t("common.noResults.title")}</h2>
          <p className="text-[#606060] text-sm">
            {hasFilters
              ? t("common.noResults.withFilters")
              : t("common.noResults.noItems")}
          </p>
        </div>

        {hasFilters && (
          <Button variant="outline" onClick={() => router.back()}>
            {t("common.noResults.return")}
          </Button>
        )}
      </div>
    </div>
  );
}
