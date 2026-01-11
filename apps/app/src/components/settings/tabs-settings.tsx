"use client";

import { useI18n } from "@/locales/client";
import { usePathname, useRouter } from "next/navigation";

export function TabsSettings() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useI18n();
  const activeTab = pathname.split("/").pop();

  return (
    <div className="flex border-b border-gray-200 mb-8">
      <button
        type="button"
        className={`pb-3 mr-8 font-medium ${
          activeTab === "profile"
            ? "text-primary border-b-2 border-primary"
            : "text-gray-600 hover:text-gray-800"
        }`}
        onClick={() => router.push("/settings/profile")}
      >
        {t("settings.tabs.profile")}
      </button>
      <button
        type="button"
        className={`pb-3 mr-8 font-medium ${
          activeTab === "password"
            ? "text-primary border-b-2 border-primary"
            : "text-gray-600 hover:text-gray-800"
        }`}
        onClick={() => router.push("/settings/password")}
      >
        {t("settings.tabs.password")}
      </button>
      <button
        type="button"
        className={`pb-3  mr-8 font-medium ${
          activeTab === "users"
            ? "text-primary border-b-2 border-primary"
            : "text-gray-600 hover:text-gray-800"
        }`}
        onClick={() => router.push("/settings/users")}
      >
        {t("settings.tabs.users")}
      </button>
      <button
        type="button"
        className={`pb-3 font-medium ${
          activeTab === "organizations"
            ? "text-primary border-b-2 border-primary"
            : "text-gray-600 hover:text-gray-800"
        }`}
        onClick={() => router.push("/settings/organizations")}
      >
        {t("settings.tabs.organizations")}
      </button>
    </div>
  );
}
