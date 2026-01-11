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
  const workspaceId = currentWorkspace?.id;
  const { balance, setCredits } = useWorkspaceCreditsStore();
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
          credits: billingData.credits,
          street: billingData.street ?? "",
          city: billingData.city ?? "",
          zip: billingData.zip ?? "",
          country: billingData.country,
          company: billingData.company,
          civility: billingData.civility as any,
          firstName: billingData.firstName,
          lastName: billingData.lastName,
          acceptTerms: billingData.acceptTerms,
        });

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        /*  toast({
          title: commonT("error.somethingWentWrong"),
          variant: "destructive",
        }); */
      }
    };

    fetchBillingInfo();
  }, [orgId, setField, setAllFields]);

  useEffect(() => {
    const fetchWorkspaceCredits = async () => {
      if (!workspaceId) return;

      setIsLoading(true);
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/credits`, {
          cache: "no-store",
        });

        let json: any = null;
        try {
          json = await res.json();
        } catch {
          // body non-JSON (ou vide)
        }

        if (!res.ok) {
          console.error("[WORKSPACE_CREDITS_FETCH_ERROR]", {
            status: res.status,
            workspaceId,
            json,
          });
          return;
        }

        if (json?.success) {
          setCredits(json.data.balance, json.data.currency);
        } else {
          console.error("[WORKSPACE_CREDITS_BAD_RESPONSE]", {
            workspaceId,
            json,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaceCredits();
  }, [workspaceId, setCredits]);

  const isFormValid = street && zip && city && country && company;

  return (
    <header
      className={cn(
        "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6",
        className
      )}
    >
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-4">
          {/*  <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button> */}

          <Button
            onClick={firstModal.onTrue}
            variant="ghost"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <CreditCard className="h-4 w-4" />
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="text-sm font-medium">
                {balance} {headerT("credits")}
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
                      value={zip}
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
                      value={country}
                      onValueChange={(value) => setField("country", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ivoryCoast">
                          {countriesT("ivoryCoast")}
                        </SelectItem>
                        <SelectItem value="france">
                          {countriesT("france")}
                        </SelectItem>
                        <SelectItem value="spain">
                          {countriesT("spain")}
                        </SelectItem>
                        <SelectItem value="uk">{countriesT("uk")}</SelectItem>
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
                <Link href={"/pricing/" + orgId}>
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
