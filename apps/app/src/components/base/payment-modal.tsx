"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { Button } from "@tada/ui/components/button";
import { Label } from "@tada/ui/components/label";
import { Input } from "@tada/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { Checkbox } from "@tada/ui/components/checkbox";
import { useState } from "react";
import { useBillingStore } from "@/hooks/use-billing-store";
import { useCurrentLocale, useScopedI18n } from "@/locales/client";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSession } from "@/lib/auth-client";
import { useWorkspaceCreditsPurchaseStore } from "@/hooks/use-workspace-credits-purchase-store";
import { countries } from "@/constants/countries";

// --- Types alignés XOF ---
type PlanCode = "starter" | "growth" | "business" | "entreprise";

type PrepareResponse = {
  purchase: {
    id: string;
    workspaceId: string;
    organizationId: string;
    planCode: PlanCode | null;
    credits: number;

    unitPriceXof: number;
    totalAmountXof: number;
    currency: "XOF";

    provider: "paystack";
    providerRef: string;
    providerStatus: "pending";
    metadata: any;
    createdAt: string;
    updatedAt: string;
  };
  paystack: {
    payload: {
      email: string;
      reference: string;
      amount: number; // subunit
      currency?: string;
      callback_url?: string;
      metadata?: any;
      channels?: string[];
    };
  };
};

type InitializeResponse =
  | {
      authorization_url: string;
      reference?: string;
      purchaseId?: string;
    }
  | {
      data: {
        authorization_url: string;
        reference?: string;
      };
    };

interface PaymentModalProps {
  open: boolean;
  onOpenChange: () => void;
  inComingredits: number;
  workspaceId: string;
  prepared?: any;
}

function formatMoneyXOF(value: number, locale: string) {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(safe);
}

export function PaymentModal({
  open,
  onOpenChange,
  inComingredits,
  workspaceId,
}: PaymentModalProps) {
  const commonT = useScopedI18n("common");
  const paymentModalT = useScopedI18n("paymentModal");
  const formT = useScopedI18n("form");
  const { data: session } = useSession();
  const locale = useCurrentLocale();

  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const {
    street,
    city,
    zip,
    country,
    company,
    civility,
    firstName,
    lastName,
    acceptTerms,
    organizationId,
    setField,
  } = useBillingStore();

  const {
    credits,
    unitPrice,
    currency,
    workspaceId: storeWorkspaceId,
    setCurrency,
  } = useWorkspaceCreditsPurchaseStore();

  const effectiveWorkspaceId = (storeWorkspaceId || workspaceId || "").trim();

  if (currency !== "XOF") {
    setCurrency("XOF");
  }

  const safeCredits =
    typeof credits === "number" && Number.isFinite(credits)
      ? Math.max(0, Math.trunc(credits))
      : 0;

  const safeUnit =
    typeof unitPrice === "number" && Number.isFinite(unitPrice)
      ? Math.max(0, Math.trunc(unitPrice))
      : 0;

  const totalXof = safeCredits * safeUnit;

  const isFormValid =
    !!acceptTerms &&
    !!firstName &&
    !!lastName &&
    !!street &&
    !!zip &&
    !!city &&
    !!country &&
    !!effectiveWorkspaceId &&
    safeCredits > 0;

  const preparePurchase = async () => {
    setIsPreparing(true);

    try {
      const res = await fetch(
        `/api/workspaces/${encodeURIComponent(effectiveWorkspaceId)}/credits/purchase/prepare`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credits: safeCredits,
            currency: "XOF",
            customerEmail: session?.user?.email ?? undefined,
            organizationId: organizationId || undefined,
            billing: {
              street,
              city,
              zip,
              country,
              company,
              civility,
              firstName,
              lastName,
              acceptTerms,
              locale,
            },
          }),
        },
      );

      const json = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) {
        throw new Error(json?.error || "Failed to prepare purchase");
      }

      return json as PrepareResponse;
    } finally {
      setIsPreparing(false);
    }
  };

  const initializePaystack = async (purchaseIdOrRef?: {
    purchaseId?: string;
    reference?: string;
  }) => {
    setIsInitializing(true);

    try {
      const res = await fetch(
        `/api/workspaces/${encodeURIComponent(effectiveWorkspaceId)}/credits/purchase/initialize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            purchaseId: purchaseIdOrRef?.purchaseId,
            reference: purchaseIdOrRef?.reference,
          }),
        },
      );

      const json = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) {
        throw new Error(json?.error || "Failed to initialize Paystack");
      }

      const data = json as InitializeResponse;

      const url =
        "authorization_url" in data
          ? data.authorization_url
          : data?.data?.authorization_url;

      if (!url) {
        throw new Error("Paystack authorization_url missing");
      }

      window.location.href = url;
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast({
        title: commonT("error.somethingWentWrong"),
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    setLoadingCheckout(true);

    try {
      const preparedData = await preparePurchase();

      await initializePaystack({
        purchaseId: preparedData.purchase?.id,
        reference: preparedData.purchase?.providerRef,
      });
    } catch (err: any) {
      toast({
        title: commonT("error.somethingWentWrong"),
        description: err?.message || "Erreur lors de la redirection Paystack.",
        variant: "destructive",
      });
    } finally {
      setLoadingCheckout(false);
    }
  };

  const isBusy = loadingCheckout || isPreparing || isInitializing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl p-0 gap-0 rounded-lg max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader className="px-6 py-4 bg-[#F8F9F9] border-b flex flex-row items-center justify-between flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">
            {paymentModalT("title")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch flex-grow">
          {/* Summary */}
          <div className="space-y-6 bg-[#F5F5F5] p-6 flex flex-col justify-between">
            <h2 className="text-lg font-bold">
              {paymentModalT("summarySection.title")}
            </h2>

            <div className="space-y-2 flex-grow text-sm text-gray-700">
              <div className="flex justify-between">
                <span>
                  {paymentModalT("summarySection.creditsLabel")} {safeCredits}{" "}
                  {safeCredits > 1 ? "crédits" : "crédit"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Prix par crédit :</span>
                <span>{formatMoneyXOF(safeUnit, locale)}</span>
              </div>

              <div className="flex justify-between font-bold text-lg">
                <span>Total :</span>
                <span>{formatMoneyXOF(totalXof, locale)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              {paymentModalT("summarySection.disclaimer")}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6 p-6">
            <h2 className="text-lg font-bold">
              {paymentModalT("paymentMethodSection.title")}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="civility">
                  {paymentModalT("form.civility")}
                </Label>
                <Select
                  value={civility}
                  onValueChange={(value) => setField("civility", value as any)}
                  disabled={isBusy}
                >
                  <SelectTrigger id="civility" className="h-9">
                    <SelectValue placeholder={paymentModalT("form.civility")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m">{formT("civility.mr")}</SelectItem>
                    <SelectItem value="mme">{formT("civility.mrs")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="firstName">
                  {paymentModalT("form.firstName")}
                </Label>
                <Input
                  id="firstName"
                  placeholder={paymentModalT("form.firstName")}
                  value={firstName}
                  onChange={(e) => setField("firstName", e.target.value)}
                  className="h-9"
                  disabled={isBusy}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="lastName">
                  {paymentModalT("form.lastName")}
                </Label>
                <Input
                  id="lastName"
                  placeholder={paymentModalT("form.lastName")}
                  value={lastName}
                  onChange={(e) => setField("lastName", e.target.value)}
                  className="h-9"
                  disabled={isBusy}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="street-number">
                  {paymentModalT("form.streetNumber")}
                </Label>
                <Input
                  id="street-number"
                  placeholder={paymentModalT("form.streetNumber")}
                  value={street}
                  onChange={(e) => setField("street", e.target.value)}
                  className="h-9"
                  disabled={isBusy}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="postal-code">
                  {paymentModalT("form.postalCode")}
                </Label>
                <Input
                  id="postal-code"
                  placeholder={paymentModalT("form.postalCode")}
                  value={zip}
                  onChange={(e) => setField("zip", e.target.value)}
                  className="h-9"
                  disabled={isBusy}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="city">{paymentModalT("form.city")}</Label>
                <Input
                  id="city"
                  placeholder={paymentModalT("form.city")}
                  value={city}
                  onChange={(e) => setField("city", e.target.value)}
                  className="h-9"
                  disabled={isBusy}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="country">{paymentModalT("form.country")}</Label>
                <Select
                  value={country || ""}
                  onValueChange={(value) => setField("country", value)}
                  disabled={isBusy}
                >
                  <SelectTrigger id="country" className="h-9">
                    <SelectValue placeholder={paymentModalT("form.country")} />
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

              <div className="space-y-1 col-span-2">
                <Label htmlFor="company">{paymentModalT("form.company")}</Label>
                <Input
                  id="company"
                  placeholder={paymentModalT("form.company")}
                  value={company}
                  onChange={(e) => setField("company", e.target.value)}
                  className="h-9"
                  disabled={isBusy}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) =>
                  setField("acceptTerms", !!checked)
                }
                disabled={isBusy}
              />
              <Label htmlFor="terms" className="text-sm">
                {paymentModalT("form.acceptTerms")}{" "}
                <a href="#" className="text-appinio-blue hover:underline">
                  {paymentModalT("form.termsAndConditions")}
                </a>
              </Label>
            </div>

            <Button
              className="w-full h-9"
              onClick={handleSubmit}
              disabled={!isFormValid || isBusy}
            >
              {isBusy ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isPreparing
                    ? "Préparation..."
                    : isInitializing
                      ? "Redirection Paystack..."
                      : "Chargement..."}
                </span>
              ) : (
                <>Payer avec Paystack — {formatMoneyXOF(totalXof, locale)}</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
