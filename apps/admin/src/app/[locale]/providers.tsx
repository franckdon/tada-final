"use client";

import { I18nProviderClient } from "@/locales/client";

export const Providers = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) => {
  return (
    <I18nProviderClient locale={params.locale}>
      {children}
    </I18nProviderClient>
  );
};
