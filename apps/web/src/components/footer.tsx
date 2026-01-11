"use client";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { usePathname } from "next/navigation";
const Footer = () => {
  const t = useI18n();
  const currentDate = new Date();
  const pathname = usePathname();
  return (
    <footer className=" text-white">
      <div className="bg-black">
        {/* Footer content */}
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Logo column */}
            <div className="col-span-1">
              <div>
                <Link href="/" className="inline-block mb-6">
                  <Image
                    src="/logo.png"
                    alt="Tada"
                    width={140}
                    height={43}
                    className="h-11 w-auto"
                  />
                </Link>
                <p className="text-gray-300 text-sm mb-4">
                  {t("home.footer.logo_desc")}
                </p>

                {pathname === "/contributors" && (
                  <div className="flex  space-x-12 mb-4">
                    <Link
                      href="https://play.google.com/store/apps/details?id=com.tada.contributors"
                      target="_blank"
                    >
                      <img
                        className="w-auto"
                        src="/images/play-store.svg"
                        alt="Play Store"
                      />
                    </Link>

                    <Link
                      href="https://apps.apple.com/us/app/tada-contributors/id6749110000"
                      target="_blank"
                    >
                      <img
                        className="w-auto"
                        src="/images/apple-store.svg"
                        alt="Apple Store "
                      />
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex space-x-3 mb-6">
                <Link
                  href="https://www.facebook.com/tadaiq"
                  className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-premise-blue rounded-full transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </Link>
                <Link
                  href="https://www.instagram.com/tadaiq"
                  className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-premise-blue rounded-full transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </Link>
                <Link
                  href="https://www.linkedin.com/company/tadaiq"
                  className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-premise-blue rounded-full transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Business Solutions column */}
            <div className="col-span-1">
              <h3 className="text-lg font-rational-semibold mb-4">
                {t("home.header.menus.solutions")}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/solutions/use-case"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {t("home.header.menus.solutions_menu.by_use_case")}
                  </Link>
                </li>

                <li>
                  <Link
                    href="/solutions/industry"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {t("home.header.menus.solutions_menu.by_industry")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company column */}
            <div className="col-span-1">
              <h3 className="text-lg font-rational-semibold mb-4">
                {t("home.header.menus.about")}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about-us"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {t("home.header.menus.about_menu.about_us")}
                  </Link>
                </li>

                <li>
                  <Link
                    href="/get-in-touch"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {t("home.header.menus.about_menu.contact_us")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/schedule-a-demo"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {t("home.header.menus.about_menu.schedule_a_demo")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {t("home.header.menus.pricing")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Footer bottom */}
        <div className="border-t border-gray-800 py-6">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400 mb-4 md:mb-0">
                © Copyright {currentDate.getFullYear()},{" "}
                {t("home.footer.all_rights_reserved")}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <Link
                  href="/terms-of-use"
                  className="hover:text-white transition-colors"
                >
                  {t("home.footer.terms_of_use")}
                </Link>
                <Link
                  href="/privacy-policy"
                  className="hover:text-white transition-colors"
                >
                  {t("home.footer.privacy_policy")}
                </Link>
                <Link
                  href="/opt-out-preferences"
                  className="hover:text-white transition-colors"
                >
                  {t("home.footer.cookie_policy")}
                </Link>
                <Link
                  href="/saas-agreement"
                  className="hover:text-white transition-colors"
                >
                  {t("home.footer.saas_agreement")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
