"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/locales/client";

interface AnnexeRightMenuProp {
  page?: string;
}

export default function RightMenu({page}: AnnexeRightMenuProp) {
  const [isFixed, setIsFixed] = useState(false);
  const t = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Distance avant le bas de page
      const bottomLimit =
        document.documentElement.scrollHeight - window.innerHeight - 200;

      // Conditions de fixation
      if (scrollY > 150 && scrollY < bottomLimit) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="hidden lg:block col-span-1">
      <nav
        className={`w-64 float-end bg-white shadow-md rounded-md border-t-2 border-primary px-4 py-8 transition-all duration-300
        ${isFixed ? "fixed top-32 right-32" : "relative"}
      `}
      >
        <ul className="flex flex-col gap-3">
          <li className={`p-2 rounded hover:bg-gray-100 
            ${ page == "terms_of_use" ? "bg-gray-200" : null }`}>
            <a href="/terms-of-use">{t("home.footer.terms_of_use")}</a>
          </li>
          <li className={`p-2 rounded hover:bg-gray-100 
            ${ page == "privacy_policy" ? "bg-gray-200" : null }`}>
            <a href="/privacy-policy">{t("home.footer.privacy_policy")}</a>
          </li>
          <li className={`p-2 rounded hover:bg-gray-100 
            ${ page == "cookie_policy" ? "bg-gray-200" : null }`}>
            <a href="/opt-out-preferences">{t("home.footer.cookie_policy")}</a>
          </li>
          <li className={`p-2 rounded hover:bg-gray-100 
            ${ page == "saas_agreement" ? "bg-gray-200" : null }`}>
            <a href="/saas-agreement">{t("home.footer.saas_agreement")}</a>
          </li>
        </ul>
      </nav>
    </div>
  );
}