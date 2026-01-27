"use client";

import { Inbox } from "@novu/nextjs";

import { signOut } from "@/lib/auth-client";
import {
  useChangeLocale,
  useCurrentLocale,
  useI18n,
  useScopedI18n,
} from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@tada/ui/components/dropdown";
import { cn } from "@tada/ui/lib/utils";
import {
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  Gift,
  Loader2,
  LogOut,
  Settings,
  HelpCircle,
  Layers,
  Globe,
  Bell,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@prisma/client";
import { useBoolean } from "@/hooks/use-boolean";
import { CreditsModal } from "./credit-modal";
import { PaymentModal } from "./payment-modal";
import { useBillingStore } from "@/hooks/use-billing-store";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarImage } from "@tada/ui/components/avatar";
import { useWorkspace } from "@/context/workspace-context";
import { useWorkspaceCreditsStore } from "@/hooks/use-workspace-credit-store";
import { useWorkspaceCredits } from "@/hooks/use-workspace-credits";

import { countries } from "@/constants/countries";

interface HeaderProps {
  title?: string;
  className?: string;
  user?: User;
}

const languages = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
] as const;

type LanguageCode = (typeof languages)[number]["code"];

const appearance = {
  variables: {
    colorPrimary: "#FF5B4A",
    colorPrimaryForeground: "white",
  },
};

export function Header({ title = "Dashboard", className, user }: HeaderProps) {
  const t = useI18n();
  const commonT = useScopedI18n("common");
  const headerT = useScopedI18n("header");

  const router = useRouter();
  const { setTheme, theme } = useTheme();

  const creditModal = useBoolean(false);
  const paymentModal = useBoolean(false);

  const changeLocale = useChangeLocale();
  const currentLocale = useCurrentLocale();

  const { data: organizations } = authClient.useListOrganizations();
  const orgId = organizations?.[0]?.id;

  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id ?? null;

  const [preparedPurchase, setPreparedPurchase] = useState<any | null>(null);

  // 1) Hook unique qui gère cache + fetch + anti-race
  useWorkspaceCredits(workspaceId);

  // 2) Sélecteurs Zustand stables
  const balance = useWorkspaceCreditsStore((s) => s.balance);
  const subscription = useWorkspaceCreditsStore((s) => s.subscription);
  const loading = useWorkspaceCreditsStore((s) => s.loading);

  const { setField, setAllFields } = useBillingStore();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleAsYouGo = (prepared?: any) => {
    if (prepared) setPreparedPurchase(prepared);
    creditModal.onFalse();
    paymentModal.onTrue();
  };

  const currentLanguage =
    languages.find((lang) => lang.code === currentLocale) || languages[0];

  useEffect(() => {
    if (organizations && organizations?.length <= 0) {
      toast({
        title: commonT("error.somethingWentWrong"),
        variant: "destructive",
      });
    }
  }, [organizations, commonT]);

  const normalizeCountry = (value: unknown) => {
    if (typeof value !== "string") return "FR";
    const v = value.trim();

    // déjà un code connu
    if (countries[v as keyof typeof countries]) return v;

    // sinon on essaie par nom (ex: "France")
    const found = Object.entries(countries).find(
      ([, c]) => c.name.toLowerCase() === v.toLowerCase(),
    );
    return found?.[0] ?? "FR";
  };

  useEffect(() => {
    const fetchBillingInfo = async () => {
      if (!orgId) return;

      try {
        setField("organizationId", orgId);

        const res = await fetch(`/api/billing/get-one?organizationId=${orgId}`);
        const data = await res.json();

        if (!data.success) return;

        const billingData = data.data;

        setAllFields({
          credits:
            typeof billingData.credits === "number" ? billingData.credits : 0,
          street: billingData.street ?? "",
          city: billingData.city ?? "",
          zip: billingData.zip ?? "",
          country: normalizeCountry(billingData.country ?? "FR"),
          company: billingData.company ?? "",
          civility: billingData.civility ?? "mr",
          firstName: billingData.firstName ?? "",
          lastName: billingData.lastName ?? "",
          acceptTerms: Boolean(billingData.acceptTerms),
        });
      } catch {
        // noop
      }
    };

    fetchBillingInfo();
  }, [orgId, setField, setAllFields]);

  return (
    <header
      className={cn(
        "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6",
        className,
      )}
    >
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-4">
          {/* ✅ Option A : click = CreditsModal directement (firstModal supprimé) */}
          <Button
            onClick={creditModal.onTrue}
            variant="ghost"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <CreditCard className="h-4 w-4" />
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="text-sm font-medium">
                {balance} {headerT("credits")}
              </span>
            )}
          </Button>

          {/* Lang */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 rounded-md text-blue-700 hover:bg-blue-100 flex items-center space-x-2"
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase">
                  {currentLanguage.code}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => changeLocale(lang.code as LanguageCode)}
                  className="text-sm"
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Updates */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-600 hover:text-blue-700"
              >
                <Gift className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96 p-0" align="end">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">
                  {headerT("latestUpdates")}
                </h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="p-4 border-b hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      {headerT("improved")}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {headerT("aiInsightsTitle")}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {headerT("aiInsightsDesc")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-b hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      {headerT("new")}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {headerT("pValuesTitle")}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {headerT("pValuesDesc")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-b hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      {headerT("new")}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {headerT("filterMatchingTitle")}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {headerT("filterMatchingDesc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {headerT("poweredBy")}
                </span>
                <Button variant="link" className="text-xs p-0 h-auto">
                  {headerT("seeAllChanges")}
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Inbox */}
          <Inbox
            applicationIdentifier="rkwq3JiGAl2y"
            subscriber={"685ed8ca56253bc5d63e4329"}
            appearance={appearance}
            renderBell={() => (
              <button className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-blue-100">
                <Bell className="h-4 w-4 text-blue-600" />
              </button>
            )}
          />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-1 p-2"
              >
                {user?.image ? (
                  <Avatar>
                    <AvatarImage src={user?.image} />
                  </Avatar>
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.name?.charAt(0)}
                    </span>
                  </div>
                )}

                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>{t("user.menu.title")}</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <Link href="/settings/profile">
                  <span>{t("user.menu.settings")}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <CircleDollarSign className="mr-2 h-4 w-4" />
                <Link href={"/pricing"}>
                  <span>{t("user.menu.pricings")}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Layers className="mr-2 h-4 w-4" />
                <Link href="/invoices">
                  <span>{t("invoices.title")}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <Link href="/support">
                  <span>{t("user.menu.support")}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("user.menu.signOut")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CreditsModal
        open={creditModal.value}
        toggleOpen={creditModal.onToggle}
        handleAsYouGo={handleAsYouGo}
        organizationId={organizations?.[0]?.id}
        workspaceId={workspaceId!}
        workspacePlanCode={(subscription?.planCode as any) ?? null}
      />

      <PaymentModal
        open={paymentModal.value}
        onOpenChange={paymentModal.onFalse}
        inComingredits={balance}
        workspaceId={workspaceId!}
        prepared={preparedPurchase}
      />
    </header>
  );
}
