"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChangeLocale, useCurrentLocale, useI18n } from "@/locales/client";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  featuresByIndustry,
  featuresByUseCase,
  solutions,
} from "./solutions/data";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentLocale = useCurrentLocale();
  const changeLocale = useChangeLocale();
  const t = useI18n();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-gray-100 py-1">
        <div className="container-custom flex justify-start items-center space-x-4 text-sm">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center hover:text-premise-blue">
              {currentLocale === "en"
                ? t("home.header.langs.en")
                : t("home.header.langs.fr")}
              <ChevronDown className="h-4 w-4 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <button onClick={() => changeLocale("en")} type="button">
                  {t("home.header.langs.en")}
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button onClick={() => changeLocale("fr")} type="button">
                  {t("home.header.langs.fr")}
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main header */}
      <div className="container-custom py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo-group.png"
              alt="Tada"
              width={140}
              height={43}
              className="h-11 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <div className="relative group">
              <button
                type="button"
                className="flex items-center space-x-1 py-2 nav-link font-medium"
              >
                <span>{t("home.header.menus.solutions")}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute left-0 top-full mt-1 w-96 bg-white shadow-lg rounded-md py-6 px-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="grid grid-cols-2 gap-8">
                  {/* By Use Case */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                      {t("home.header.menus.solutions_menu.by_use_case")}
                    </h3>
                    <div className="space-y-2">
                      {featuresByUseCase.slice(0, 3).map((solution) => {
                        // on construit la clé à partir du titre ou de l’ID
                        const translationKey = `solutions.featuresByUseCase.${solution.id}`;

                        return (
                          <Link
                            href={solution.link}
                            className="block py-1 text-sm text-gray-600 hover:text-primary transition-colors"
                            key={solution.id}
                          >
                            <div>
                              <div className="font-medium">
                                {t(`${translationKey}.title` as any, {})} {/* {solution.title} */}
                              </div>
                              <div className="text-xs text-gray-500">
                                {t(`${translationKey}.description` as any, {})} {/* {solution.description} */}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <Link
                      href="/solutions/use-case"
                      className="inline-block mt-3 text-sm text-primary font-medium hover:underline"
                    >
                      {t("home.header.menus.solutions_menu.all_use_cases")}
                    </Link>
                  </div>

                  {/* By Industry & Role */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                      {t("home.header.menus.solutions_menu.by_industry")}
                    </h3>
                    <div className="space-y-2">
                      {featuresByIndustry.slice(0, 3).map((solution) => {
                        const translationKey = `solutions.featuresByIndustry.${solution.id}`;
                        return (
                          <Link
                            href={solution.link}
                            className="block py-1 text-sm text-gray-600 hover:text-primary transition-colors"
                            key={solution.id}
                          >
                            <div>
                              <div className="font-medium">
                                {t(`${translationKey}.title` as any, {})} 
                              </div>
                              <div className="text-xs text-gray-500">
                                {t(`${translationKey}.description` as any, {})}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <Link
                      href="/solutions/industry"
                      className="inline-block mt-3 text-sm text-primary font-medium hover:underline"
                    >
                      {t("home.header.menus.solutions_menu.all_industries")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/pricing" className="nav-link font-medium">
              {t("home.header.menus.pricing")}
            </Link>

            <div className="relative group">
              <button
                type="button"
                className="flex items-center space-x-1 py-2 nav-link font-medium"
              >
                <span>{t("home.header.menus.about")}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute left-0 top-full mt-1 w-64 bg-white shadow-lg rounded-md py-3 px-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="py-1">
                  <Link
                    href="/about-us"
                    className="block py-2 px-3 hover:bg-gray-100 rounded-md"
                  >
                    {t("home.header.menus.about_menu.about_us")}
                  </Link>
                  <Link
                    href="/how-work-it"
                    className="block py-2 px-3 hover:bg-gray-100 rounded-md"
                  >
                    {t("home.header.menus.about_menu.how_work_it")}
                  </Link>
                  <Link
                    href="/get-in-touch"
                    className="block py-2 px-3 hover:bg-gray-100 rounded-md"
                  >
                    {t("home.header.menus.about_menu.contact_us")}
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="https://contributors.tadaiq.com/"
              className="nav-link font-rational-medium"
              target="_blank"
            >
              {t("home.header.menus.contributors")}
            </Link>

            <Link
              href="/schedule-a-demo"
              className="bg-primary text-white px-5 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
            >
              {t("home.header.menus.schedule_a_demo")}
            </Link>

            <Link
              href="https://tada-client.vercel.app/login"
              className="nav-link font-medium"
              target="_blank"
            >
              {t("home.header.menus.login")}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="container-custom py-4">
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <button
                  type="button"
                  className="w-full flex justify-between items-center py-2 font-medium"
                >
                  <span>{t("home.header.menus.solutions")}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="pl-4 pb-2 space-y-2">
                  <Link
                    href="/solutions/use-case"
                    className="block py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {t("home.header.menus.solutions_menu.by_use_case")}
                  </Link>
                  <Link
                    href="/solutions/industry"
                    className="block py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {t("home.header.menus.solutions_menu.by_industry")}
                  </Link>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-2">
                <button
                  type="button"
                  className="w-full flex justify-between items-center py-2 font-medium"
                >
                  <span>{t("home.header.menus.about")}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="pl-4 pb-2">
                  <div className="py-1">
                    <Link
                      href="/about-us"
                      className="block py-2 px-3 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("home.header.menus.about_menu.about_us")}
                    </Link>
                    <Link
                      href="/how-work-it"
                      className="block py-2 px-3 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("home.header.menus.about_menu.how_work_it")}
                    </Link>
                    <Link
                      href="/get-in-touch"
                      className="block py-2 px-3 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("home.header.menus.about_menu.contact_us")}
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                href="https://contributors.tadaiq.com"
                className="block py-2 font-medium"
                onClick={() => setIsOpen(false)}
                target="_blank"
              >
                {t("home.header.menus.contributors")}
              </Link>

              <Link
                href="/schedule-a-demo"
                className="block bg-primary text-white px-5 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity text-center"
                onClick={() => setIsOpen(false)}
              >
                {t("home.header.menus.schedule_a_demo")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
