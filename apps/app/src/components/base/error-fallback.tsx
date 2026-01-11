"use client";

import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { useRouter } from "next/navigation";

export function ErrorFallback() {
  const router = useRouter();
  const t = useI18n();

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div>
        <h2 className="text-md">{t("common.error.somethingWentWrong")}</h2>
      </div>
      <Button onClick={() => router.refresh()} variant="outline">
        {t("common.error.tryAgain")}
      </Button>
    </div>
  );
}
