import { cn } from "@tada/ui/lib/utils";
import "@tada/ui/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Sora } from "next/font/google";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Providers } from "./providers";
import NavigationLoadingProviders from "./navigation-loading-providers";

export const metadata: Metadata = {
  title: "Tada",
  description: "Le Uber des collectes de données",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)" },
    { media: "(prefers-color-scheme: dark)" },
  ],
};

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

export const preferredRegion = ["fra1", "sfo1", "iad1"];
export const maxDuration = 60;

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          `${GeistSans.variable} ${GeistMono.variable} ${sora.variable}`,
          "whitespace-pre-line overscroll-none antialiased"
        )}
      >
        <NavigationLoadingProviders>
          <ThemeProvider attribute="class" defaultTheme="light">
            <Providers params={{ locale }}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NavigationLoadingProviders>
      </body>
    </html>
  );
}
