"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@prisma/client";
import { useTheme } from "next-themes";

import { signOut, authClient } from "@/lib/auth-client";
import {
  useChangeLocale,
  useCurrentLocale,
  useI18n,
  useScopedI18n,
} from "@/locales/client";

import { Button } from "@tada/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tada/ui/components/dropdown";
import { Avatar, AvatarImage } from "@tada/ui/components/avatar";
import { cn } from "@tada/ui/lib/utils";

import {
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  Gift,
  HelpCircle,
  Layers,
  Loader2,
  LogOut,
  Settings,
  Globe,
} from "lucide-react";

import { toast } from "@/hooks/use-toast";
import { useBoolean } from "@/hooks/use-boolean";
import { useBillingStore } from "@/hooks/use-billing-store";
import { useWorkspace } from "@/context/workspace-context";

import { useWorkspaceCredits } from "@/hooks/use-workspace-credits";
import { useWorkspaceCreditsStore } from "@/hooks/use-workspace-credit-store";

import { CreditsModal } from "./credit-modal";
import { PaymentModal } from "./payment-modal";
import { CreditsOverviewModal } from "./credits-overview-modal";

import { countries } from "@/constants/countries";

import { useCreditsPurchaseFlowStore } from "@/stores/useCreditsPurchaseFlowStore";
import { NotificationsBell } from "../notifications/notifications-bell";

interface HeaderProps {
  title?: string;
  className?: string;
  user?: User;
}

const LANGUAGES = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]["code"];

const novuAppearance = {
  variables: {
    colorPrimary: "#FF5B4A",
    colorPrimaryForeground: "white",
  },
};

function normalizeCountry(value: unknown) {
  if (typeof value !== "string") return "FR";
  const v = value.trim();

  // déjà un code connu
  if (countries[v as keyof typeof countries]) return v;

  // sinon on essaie par nom (ex: "France")
  const found = Object.entries(countries).find(
    ([, c]) => c.name.toLowerCase() === v.toLowerCase(),
  );
  return found?.[0] ?? "FR";
}

export function Header({ title = "Dashboard", className, user }: HeaderProps) {
  const router = useRouter();
  const { setTheme } = useTheme();

  const t = useI18n();
  const commonT = useScopedI18n("common");
  const headerT = useScopedI18n("header");

  // Modals
  const creditModal = useBoolean(false); // purchase modal
  const creditsOverviewModal = useBoolean(false); // Appinio-like overview
  const paymentModal = useBoolean(false);

  // Locale
  const changeLocale = useChangeLocale();
  const currentLocale = useCurrentLocale();
  const currentLanguage = useMemo(
    () => LANGUAGES.find((l) => l.code === currentLocale) || LANGUAGES[0],
    [currentLocale],
  );

  // Org / workspace
  const { data: organizations } = authClient.useListOrganizations();
  const orgId = organizations?.[0]?.id ?? null;

  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id ?? null;

  // Billing store
  const { setField, setAllFields } = useBillingStore();

  // Credits store (Zustand)
  useWorkspaceCredits(workspaceId); // cache + fetch + anti-race (ton hook)

  const balance = useWorkspaceCreditsStore((s) => s.balance);
  const subscription = useWorkspaceCreditsStore((s) => s.subscription);
  const creditsLoading = useWorkspaceCreditsStore((s) => s.loading);

  // Payment
  const creditsModalOpen = useCreditsPurchaseFlowStore(
    (s) => s.creditsModalOpen,
  );
  const paymentModalOpen = useCreditsPurchaseFlowStore(
    (s) => s.paymentModalOpen,
  );
  const preparedPurchase = useCreditsPurchaseFlowStore(
    (s) => s.preparedPurchase,
  );

  const openCreditsModal = useCreditsPurchaseFlowStore(
    (s) => s.openCreditsModal,
  );
  const openPaymentModal = useCreditsPurchaseFlowStore(
    (s) => s.openPaymentModal,
  );
  const closeCreditsModal = useCreditsPurchaseFlowStore(
    (s) => s.closeCreditsModal,
  );
  const closePaymentModal = useCreditsPurchaseFlowStore(
    (s) => s.closePaymentModal,
  );

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleAsYouGo = (prepared?: any) => {
    closeCreditsModal();
    openPaymentModal(prepared ?? preparedPurchase);
  };

  const handleCreditsClick = () => {
    if (creditsLoading) return;

    if (balance === 0) {
      openCreditsModal();
      return;
    }

    creditsOverviewModal.onTrue();
  };

  const openPurchaseFromOverview = () => {
    creditsOverviewModal.onFalse();
    openCreditsModal();
  };

  const planLabel = useMemo(() => {
    if (!subscription || subscription.status !== "active") return null;

    // priorité au label humain
    const label = subscription.planLabel?.trim();
    if (label) return label;

    // fallback : code plan (Starter, Pro...) si tu veux
    const code = subscription.planCode?.trim();
    if (!code) return null;

    // format sympa
    return code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();
  }, [subscription]);

  // Guard org
  useEffect(() => {
    if (organizations && organizations.length <= 0) {
      toast({
        title: commonT("error.somethingWentWrong"),
        variant: "destructive",
      });
    }
  }, [organizations, commonT]);

  // Fetch billing info
  useEffect(() => {
    const fetchBillingInfo = async () => {
      if (!orgId) return;

      try {
        setField("organizationId", orgId);

        const res = await fetch(`/api/billing/get-one?organizationId=${orgId}`);
        const json = await res.json().catch(() => null);

        if (!json?.success) return;

        const billingData = json.data;

        setAllFields({
          credits:
            typeof billingData?.credits === "number" ? billingData.credits : 0,
          street: billingData?.street ?? "",
          city: billingData?.city ?? "",
          zip: billingData?.zip ?? "",
          country: normalizeCountry(billingData?.country ?? "FR"),
          company: billingData?.company ?? "",
          civility: billingData?.civility ?? "mr",
          firstName: billingData?.firstName ?? "",
          lastName: billingData?.lastName ?? "",
          acceptTerms: Boolean(billingData?.acceptTerms),
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
          {/* Credits */}
          <Button
            onClick={handleCreditsClick}
            variant="ghost"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            aria-label="Credits"
          >
            <CreditCard className="h-4 w-4" />
            {creditsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="text-sm font-medium flex items-center gap-2">
                <span>
                  {balance} {headerT("credits")}
                </span>

                {planLabel ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {planLabel}
                  </span>
                ) : null}
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
              {LANGUAGES.map((lang) => (
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
                aria-label="Updates"
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

          <NotificationsBell />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-1 p-2"
              >
                {user?.image ? (
                  <Avatar>
                    <AvatarImage src={user.image} />
                  </Avatar>
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.name?.charAt(0) ?? "U"}
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
                <Link href="/pricing">
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

      {/* ✅ New overview modal (Appinio-like) */}
      <CreditsOverviewModal
        open={creditsOverviewModal.value}
        onOpenChange={(v) =>
          v ? creditsOverviewModal.onTrue() : creditsOverviewModal.onFalse()
        }
        workspaceId={workspaceId ?? ""}
        balance={balance}
        onAddCredits={openPurchaseFromOverview}
        // onSeeAll={() => router.push("/billing/credits")} // optionnel
      />

      {/* Purchase modal */}
      <CreditsModal
        open={creditsModalOpen}
        toggleOpen={() =>
          creditsModalOpen ? closeCreditsModal() : openCreditsModal()
        }
        handleAsYouGo={handleAsYouGo}
        organizationId={orgId ?? undefined}
        workspaceId={workspaceId ?? ""}
        workspacePlanCode={(subscription?.planCode as any) ?? null}
      />

      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={closePaymentModal}
        inComingredits={balance}
        workspaceId={workspaceId ?? ""}
        prepared={preparedPurchase}
      />
    </header>
  );
}
