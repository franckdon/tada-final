import { cn } from "@tada/ui/lib/utils";
import "@tada/ui/globals.css";
import type { Metadata } from "next";
import { ClientProviders } from "./client-providers";
import { Sora } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

// Configuration de la police DM Sans
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

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

export const preferredRegion = ["fra1", "sfo1", "iad1"];
export const maxDuration = 60;

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={params.locale} suppressHydrationWarning>
      <body
        className={cn(
          `${GeistSans.variable} ${GeistMono.variable} ${sora.variable}`,
          "whitespace-pre-line overscroll-none antialiased",
        )}
      >
        <ClientProviders locale={params.locale}>{children}</ClientProviders>
      </body>
    </html>
  );
}
