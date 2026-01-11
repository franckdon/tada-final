"use client";

import { useCurrency } from "@/hooks/use-currency";
import { authClient, signOut, useSession } from "@/lib/auth-client";
import { useCurrentLocale, useI18n } from "@/locales/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { cn } from "@tada/ui/lib/utils";
import {
  FolderOpen,
  BadgeInfo,
  Home,
  Layers,
  TrendingUp,
  Users,
  Contact,
  Bot,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SidebarGroup } from "./sidebar-group";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { useWorkspace } from "@/context/workspace-context";

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  href: string;
  active?: boolean;
  target?: string;
}

function SidebarItem({ icon, text, href, active, target }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-4 py-3 text-sm rounded-lg transition-colors",
        active
          ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
      )}
      target={target}
    >
      <span className="mr-3">{icon}</span>
      <span>{text}</span>
    </Link>
  );
}

const languages = [
  { code: "fr", name: "Français", flag: "/flags/fr.svg" },
  { code: "en", name: "English", flag: "/flags/en.svg" },
] as const;

type LanguageCode = (typeof languages)[number]["code"];

export function Sidebar() {
  const t = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  //const { currencies, selectedCurrency, setSelectedCurrency } = useCurrency();
  const { currencies, selectedCurrency, setSelectedCurrency, hydrated } =
    useCurrency();
  const { data: session } = useSession();
  const { data: organizations } = authClient.useListOrganizations();
  const currentLocale = useCurrentLocale();

  const { currentWorkspace } = useWorkspace();

  // 🔎 On essaie aussi de récupérer le workspaceId depuis l’URL
  const parts = pathname.split("/"); // ["", "fr", "missions", "<workspaceId>", ...]
  let workspaceIdFromUrl: string | undefined;
  if (
    parts.length > 3 &&
    (parts[2] === "missions" || parts[2] === "market-beats")
  ) {
    workspaceIdFromUrl = parts[3];
  }

  const workspaceId =
    currentWorkspace?.id || workspaceIdFromUrl || "dev-workspace";

  const navigationGroups = [
    {
      items: [
        {
          icon: <Home className="h-5 w-5" />,
          text: t("navigation.home"),
          href: `/${currentLocale}`,
          target: "_self",
        },
      ],
    },
    {
      title: t("navigation.workspace"),
      items: [
        {
          icon: <FolderOpen className="h-5 w-5" />,
          text: t("navigation.missions"),
          href: `/${currentLocale}/missions/${workspaceId}`,
          target: "_self",
        },
        {
          icon: <Bot className="h-5 w-5" />,
          text: t("navigation.analysis"),
          href: `/${currentLocale}/analysis`,
          target: "_self",
        },
        {
          icon: <Users className="h-5 w-5" />,
          text: t("navigation.userManagement"),
          href: `/${currentLocale}/settings/users`,
          target: "_self",
        },
      ],
    },
    {
      title: t("navigation.explore"),
      items: [
        {
          icon: <Layers className="h-5 w-5" />,
          text: t("navigation.templates"),
          href: `/${currentLocale}/missions/org/${organizations ? organizations![0]?.id : "dev-org"}/templates`,
          target: "_self",
        },
        {
          icon: <TrendingUp className="h-5 w-5" />,
          text: t("navigation.marketBeats"),
          href: `/${currentLocale}/market-beats/${organizations ? organizations![0]?.id : "dev-org"}`,
          target: "_self",
        },
      ],
    },
    {
      title: t("navigation.knowledge"),
      items: [
        {
          icon: <BadgeInfo className="h-5 w-5" />,
          text: t("navigation.help"),
          href: "https://helpdesk.tadaiq.com",
          target: "_blank",
        },
        {
          icon: <Contact className="h-5 w-5" />,
          text: t("navigation.contactUs"),
          href: "https://chat.whatsapp.com/GCQzxT0DYS81eMzse5l9Pa?mode=r_t",
          target: "_blank",
        },
      ],
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const currentLanguage =
    languages.find((lang) => lang.code === currentLocale) || languages[0];

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 mb-3">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-group.png"
            alt="Tada Logo"
            width={90}
            height={32}
            priority
            className=""
          />
        </Link>
      </div>

      {/* Sélecteur de workspace */}
      <WorkspaceSwitcher />

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 overflow-y-auto">
        {navigationGroups.map((group, index) => (
          <SidebarGroup
            key={`${group.title || "group"}-${index}`}
            title={group.title || ""}
          >
            {group.items.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                text={item.text}
                href={item.href}
                active={pathname === item.href}
                target={item.target}
              />
            ))}
          </SidebarGroup>
        ))}
      </nav>

      {/* Currency */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {t("common.currency")}
          </p>
          <Select
            value={selectedCurrency.code}
            onValueChange={(value: string) => {
              const currency = currencies.find((c) => c.code === value);
              if (currency) setSelectedCurrency(currency);
            }}
            disabled={!hydrated}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {selectedCurrency.symbol} - {selectedCurrency.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
