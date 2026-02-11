"use client";

import { useScopedI18n } from "@/locales/client";
import { capitalizeWords } from "@/lib/string-utils";

export function GreetingSection({ name }: { name?: string | null }) {
  const t = useScopedI18n("home.greeting");

  const displayName = capitalizeWords(name) || t("fallbackName");

  return (
    <section className="rounded-xl p-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-red-500 text-center">
        {t("title", { name: displayName })}
      </h1>
    </section>
  );
}
