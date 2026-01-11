import { cn } from "@tada/ui/lib/utils";
import "@tada/ui/globals.css";
import { Sora } from "next/font/google";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

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
    <html lang="en" suppressHydrationWarning>
      <body className={cn(`${sora.variable}`)}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <Providers params={params}>
            <Header />
            {children}
            <Footer />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
