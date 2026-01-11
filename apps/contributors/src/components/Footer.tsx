"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "../locales/client";

export function Footer() {
  const t = useI18n();

  return (
    <footer className="bg-[#282828] text-white py-8 lg:pb-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex flex-col lg:flex-row pt-8 border-t border-[#5D6679] justify-between items-center space-y-6 lg:space-y-0">
          <Link href="https://www.tadaiq.com/" target="_blank">
            <Image
              src="/white-logo.svg"
              alt="Tada Logo"
              width={120}
              height={1}
              className="h-auto object-contain"
              priority
            />
          </Link>

          <nav className="flex flex-row space-x-10 items-center justify-between">
            <Link
              href="https://www.tadaiq.com/"
              target="_blank"
              className="text-white hover:opacity-80 text-xs lg:text-sm"
            >
              Tada
            </Link>
            <Link
              href="/terms-of-use"
              target="_blank"
              className="text-white hover:opacity-80 text-xs lg:text-sm"
            >
              {t("common.termsOfUse")}
            </Link>
            <Link
              href="/privacy-policy"
              target="_blank"
              className="text-white hover:opacity-80 text-xs lg:text-sm"
            >
              {t("common.privacyPolicy")}
            </Link>
            <Link
              href="/saas-agreement"
              target="_blank"
              className="text-white hover:opacity-80 text-xs lg:text-sm"
            >
              {t("common.saas_agreement")}
            </Link>
          </nav>

          <div className="text-white text-xs lg:text-sm text-center">
            {`© ${new Date().getFullYear()} Tada. ${t("common.copyright")}`}
          </div>
        </div>
      </div>
    </footer>
  );
}
