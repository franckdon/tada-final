"use client";

import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useChangeLocale, useCurrentLocale, useI18n } from "../locales/client";
import { Button } from "@tada/ui/components/button";
import { Avatar, AvatarFallback } from "@tada/ui/components/avatar";
import Link from "next/link";

const languages = [
  { code: "fr", name: "Français", flag: "/flags/fr.svg" },
  { code: "en", name: "English", flag: "/flags/en.svg" },
] as const;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useI18n();
  const changeLocale = useChangeLocale();
  const currentLocale = useCurrentLocale();

  const currentLanguage =
    languages.find((lang) => lang.code === currentLocale) || languages[0];

  return (
    <header className="w-full border-b sticky top-0 bg-white z-50 border-gray-200">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="https://www.tadaiq.com/" className="w-auto">
          <Image
            src="/logo-group.png"
            alt="Tada Logo"
            width={120}
            height={1}
            className="h-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            {t("common.home")}
          </Link>

          <Link
            href="https://helpdesk.tadaiq.com"
            target="_blank"
            className="text-gray-600 hover:text-gray-900"
          >
            {t("common.helpCenter")}
          </Link>
        </nav>

        {/* Desktop CTA Button */}
        <div className="flex gap-5">
          <Avatar
            onClick={() =>
              changeLocale(currentLanguage.code === "en" ? "fr" : "en")
            }
            className="cursor-pointer"
          >
            <AvatarFallback>{currentLanguage.code}</AvatarFallback>
          </Avatar>
          <Link
            href="https://chat.whatsapp.com/GCQzxT0DYS81eMzse5l9Pa?mode=r_t"
            target="_blank"
          >
            <Button className="hidden md:flex bg-red-500 hover:bg-red-600 text-white px-6 py-2">
              {t("common.joinCommunity")}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white shadow-lg border-t md:hidden z-50">
            <nav className="flex flex-col p-4 space-y-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 py-2">
                {t("common.home")}
              </Link>
              <Link
                href="https://helpdesk.tadaiq.com"
                target="_blank"
                className="text-gray-600 hover:text-gray-900 py-2"
              >
                {t("common.helpCenter")}
              </Link>
              <Link
                href="https://chat.whatsapp.com/GCQzxT0DYS81eMzse5l9Pa?mode=r_t"
                target="_blank"
              >
                <Button className="bg-[#FF5B4A] hover:bg-red-600 text-white px-6 py-2 mt-4">
                  {t("common.joinCommunity")}
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
