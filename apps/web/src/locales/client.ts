"use client";

import { createI18nClient } from "next-international/client";

export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

export const {
  useI18n,
  useScopedI18n,
  I18nProviderClient,
  useChangeLocale,
  useCurrentLocale,
} = createI18nClient({
  en: () => import("./en"),
  fr: () => import("./fr"),
});
