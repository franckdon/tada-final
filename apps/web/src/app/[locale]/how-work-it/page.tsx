import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { generateMetadata } from "../metadata";
import { getI18n } from "@/locales/server";
import { HowWorkIt } from "@/components/how-work-it";

export const metadata = generateMetadata({
  title: "How It Works - Tada",
  description:
    "Learn how Tada works and how it can help you get the insights you need.",
});

export default async function HowItWorksPage() {
  const t = await getI18n();
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-white py-16 md:py-20">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-rational-bold text-center mb-6">
            {t("how_work_it.title")}
          </h1>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto">
            {t("how_work_it.subtitle")}
          </p>
        </div>
      </section>

      <HowWorkIt />

      {/* CTA Section */}
      <section className="py-16   text-center">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-rational-bold mb-6">
            {t("how_work_it.contact.title")}
          </h2>
          <Link
            href="/schedule-a-demo"
            className="inline-block bg-primary text-white  px-6 py-3 rounded-md font-rational-medium hover:bg-blue-700 transition-colors"
          >
            {t("how_work_it.contact.button")}
          </Link>
        </div>
      </section>
    </div>
  );
}
