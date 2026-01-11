import { createI18nServer } from "next-international/server";
import { locales } from "./client";

export const { getI18n, getScopedI18n, getStaticParams } = createI18nServer({
  en: () => import("./en"),
  fr: () => import("./fr"),
});

export { locales };
