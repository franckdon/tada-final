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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@tada/ui/components/dropdown";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { cn } from "@tada/ui/lib/utils";
import {
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  Gift,
  Info,
  Loader2,
  LogOut,
  Moon,
  Settings,
  HelpCircle,
  Sun,
  Layers,
  Globe,
  Bell,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
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

type BillingState = {
  country: string;
  setField: (key: string, value: any) => void;
};

const appearance = {
  variables: {
    colorPrimary: "#FF5B4A",
    colorPrimaryForeground: "white",
  },
};

function formatDateFR(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(d);
}

function planBadgeClass(status?: string | null) {
  if (status === "active") return "bg-green-100 text-green-800";
  if (status === "expired") return "bg-red-100 text-red-800";
  if (status === "inactive") return "bg-gray-100 text-gray-800";
  if (status === "scheduled") return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-800";
}

export function Header({ title = "Dashboard", className, user }: HeaderProps) {
  const t = useI18n();
  const commonT = useScopedI18n("common");
  const headerT = useScopedI18n("header");
  const countriesT = useScopedI18n("countries");

  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const creditModal = useBoolean(false);
  const paymentModal = useBoolean(false);
  const firstModal = useBoolean(false);

  const changeLocale = useChangeLocale();
  const currentLocale = useCurrentLocale();

  const { data: organizations } = authClient.useListOrganizations();

  const { street, zip, city, country, company, setField, setAllFields } =
    useBillingStore();

  const orgId = organizations?.[0]?.id;

  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id ?? null;

  // 1) Hook unique qui gère cache + fetch + anti-race
  useWorkspaceCredits(workspaceId);

  // 2) Sélecteurs Zustand stables (pas d’objet inline)
  const balance = useWorkspaceCreditsStore((s) => s.balance);
  const subscription = useWorkspaceCreditsStore((s) => s.subscription);
  const loading = useWorkspaceCreditsStore((s) => s.loading);

  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleAsYouGo = () => {
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
  }, [organizations]);

  useEffect(() => {
    const fetchBillingInfo = async () => {
      if (!orgId) return;

      setIsLoading(true);

      try {
        setField("organizationId", orgId);

        const res = await fetch(`/api/billing/get-one?organizationId=${orgId}`);
        const data = await res.json();

        if (!data.success) {
          setIsLoading(false);
          /* toast({
            title: commonT("error.somethingWentWrong"),
            variant: "destructive",
          }); */
          return;
        }

        const billingData = data.data;

        //setCredits(billingData?.credits || 0);

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

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    fetchBillingInfo();
  }, [orgId, setField, setAllFields]);

  const isFormValid = street && zip && city && country && company;
  const safeZip = typeof zip === "string" ? zip : "";
  const normalizeCountry = (value: unknown) => {
    if (typeof value !== "string") return "FR";
    const v = value.trim();

    // si c’est déjà un code connu
    if (countries[v as keyof typeof countries]) return v;

    // si c’est un nom (ex: "France")
    const found = Object.entries(countries).find(
      ([, c]) => c.name.toLowerCase() === v.toLowerCase(),
    );
    return found?.[0] ?? "FR";
  };
  return (
    <header
      className={cn(
        "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6",
        className,
      )}
    >
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-4">
          <Button
            onClick={firstModal.onTrue}
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

            {/* Badge plan */}
            {subscription?.planLabel ? (
              <span
                className={cn(
                  "ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                  planBadgeClass(subscription.status),
                )}
                title={
                  subscription?.endsAt
                    ? `Expire le ${formatDateFR(subscription.endsAt)}`
                    : undefined
                }
              >
                {subscription.planLabel.toUpperCase()}
              </span>
            ) : (
              <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800">
                FREE
              </span>
            )}
          </Button>

          <Dialog open={firstModal.value} onOpenChange={firstModal.onFalse}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  {headerT("billingAddressTitle")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    {headerT("billingAddressInfo")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <Label htmlFor="street">{headerT("street")}</Label>
                    <Input
                      id="street"
                      placeholder={headerT("street")}
                      value={street}
                      onChange={(e) => setField("street", e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="postal">{headerT("postalCode")}</Label>

                    <Input
                      id="postal"
                      placeholder={headerT("postalCode")}
                      value={safeZip}
                      onChange={(e) => setField("zip", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <Label htmlFor="city">{headerT("city")}</Label>
                    <Input
                      id="city"
                      placeholder={headerT("city")}
                      value={city}
                      onChange={(e) => setField("city", e.target.value)}
                    />{" "}
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="country">{headerT("country")}</Label>

                    <Select
                      value={country || ""} // doit être une string
                      onValueChange={(value) => setField("country", value)}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Sélectionnez votre pays" />
                      </SelectTrigger>

                      <SelectContent>
                        {Object.entries(countries).map(([code, c]) => (
                          <SelectItem key={code} value={code}>
                            <span className="flex items-center gap-2">
                              <span>{c.emoji}</span>
                              <span>{c.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="w-1/2">
                  <Label htmlFor="company">{headerT("company")}</Label>
                  <Input
                    id="company"
                    placeholder={headerT("company")}
                    value={company}
                    onChange={(e) => setField("company", e.target.value)}
                  />{" "}
                </div>

                <div className="text-end">
                  <Button
                    disabled={!isFormValid}
                    className="bg-primary"
                    onClick={() => {
                      firstModal.onFalse();
                      creditModal.onTrue();
                    }}
                  >
                    {commonT("continue")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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

          {/* <Inbox
            applicationIdentifier="rkwq3JiGAl2y"
            subscriber={"685ed8ca56253bc5d63e4329"}
            appearance={appearance}
          /> */}

          <Inbox
            applicationIdentifier="rkwq3JiGAl2y"
            subscriber={"685ed8ca56253bc5d63e4329"}
            appearance={appearance}
            renderBell={(bellProps) => (
              <button
                // {...bellProps}
                className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-blue-100"
              >
                <Bell className="h-4 w-4 text-blue-600" />

                {/* {bellProps.unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-[3px] text-[10px] font-semibold text-white">
          {bellProps.unreadCount}
        </span>
      )} */}
              </button>
            )}
          />

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
                {/* <Link href={"/pricing/" + orgId}>
                  <span>{t("user.menu.pricings")}</span>
                </Link> */}
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
      />

      <PaymentModal
        open={paymentModal.value}
        onOpenChange={paymentModal.onFalse}
        inComingredits={balance}
        workspaceId={workspaceId!}
      />
    </header>
  );
}
