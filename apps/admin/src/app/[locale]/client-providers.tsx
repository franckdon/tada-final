"use client";

import { ThemeProvider } from "next-themes";
import { I18nProviderClient } from "@/locales/client";
import { Toaster } from "@/components/ui/toaster";
import { Next13ProgressBar } from "next13-progressbar";
import { useEffect, useState } from "react";

interface ClientProvidersProps {
  children: React.ReactNode;
  locale: string;
}

export function ClientProviders({ children, locale }: ClientProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      disableTransitionOnChange
      storageKey="tada-theme"
    >
      <I18nProviderClient locale={locale}>
        {children}
        <Toaster />
        {mounted && (
          <Next13ProgressBar
            height="3px"
            color="#FF5B4A"
            options={{ showSpinner: true }}
            showOnShallow
          />
        )}
      </I18nProviderClient>
    </ThemeProvider>
  );
}
