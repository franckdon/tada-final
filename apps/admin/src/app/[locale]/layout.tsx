import { cn } from "@tada/ui/lib/utils";
import "@tada/ui/globals.css";
import { DM_Sans } from "next/font/google";
import type { Metadata } from "next";
import { ClientProviders } from "./client-providers";

// Configuration de la police DM Sans
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
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
          dmSans.variable,
          "whitespace-pre-line overscroll-none antialiased font-sans"
        )}
      >
        <ClientProviders locale={params.locale}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
