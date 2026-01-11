import type { Metadata } from "next";
import "./globals.css";
import "@tada/ui/globals.css";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Tada - Insight, Everywhere, Instantly™",
  description: "Insight, Everywhere, Instantly™",
  keywords: [
    "data collection",
    "market intelligence",
    "market research",
    "retail execution",
    "Tada data",
    "global insights",
    "data analytics",
  ],
};

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  return (
    <html lang="en">
      <body className="font-rational">
        <Providers params={params}>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
