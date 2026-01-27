"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { Button } from "@tada/ui/components/button";
import { RadioGroup, RadioGroupItem } from "@tada/ui/components/radio-group";
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

// --- Types alignés avec ton CreditsModal ---
type PlanCode = "starter" | "growth" | "business" | "entreprise";

type PrepareResponse = {
  purchase: {
    id: string;
    workspaceId: string;
    organizationId: string;
    planCode: PlanCode | null;
    credits: number;
    unitPriceUsdCents: number;
    totalAmountUsdCents: number;
    currency: "USD";
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
      amount: number; // subunit (cents)
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
}

export function PaymentModal({
  open,
  onOpenChange,
  inComingredits,
  workspaceId,
}: PaymentModalProps) {
  const commonT = useScopedI18n("common");
  const paymentModalT = useScopedI18n("paymentModal");
  const countriesT = useScopedI18n("countries");
  const formT = useScopedI18n("form");
  const { data: session } = useSession();
  const locale = useCurrentLocale();

  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"invoice" | "paystack">(
    "paystack",
  );

  // --- Step 3 state ---
  const [isPreparing, setIsPreparing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [prepared, setPrepared] = useState<PrepareResponse | null>(null);
  const [payloadOpen, setPayloadOpen] = useState(false);

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
  } = useWorkspaceCreditsPurchaseStore();

  const effectiveWorkspaceId = (storeWorkspaceId || workspaceId || "").trim();

  const isFormValid =
    !!acceptTerms &&
    !!firstName &&
    !!lastName &&
    !!street &&
    !!zip &&
    !!city &&
    !!country &&
    !!effectiveWorkspaceId &&
    credits > 0;

  const preparePurchase = async () => {
    setIsPreparing(true);

    try {
      const res = await fetch(
        `/api/workspaces/${effectiveWorkspaceId}/credits/purchase/prepare`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credits,
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

      const data = json as PrepareResponse;
      setPrepared(data);
      setPayloadOpen(true);

      console.log("[PAYSTACK PREPARE] purchase:", data.purchase);
      console.log("[PAYSTACK PREPARE] payload:", data.paystack?.payload);

      return data;
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
        `/api/workspaces/${effectiveWorkspaceId}/credits/purchase/initialize`,
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
    console.log("[PaymentModal] submit clicked", {
      credits,
      unitPrice,
      currency,
      storeWorkspaceId,
      propWorkspaceId: workspaceId,
      effectiveWorkspaceId,
      organizationId,
      sessionUserId: session?.user?.id,
      paymentMethod,
    });

    if (!isFormValid) {
      toast({
        title: commonT("error.somethingWentWrong"),
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "invoice") {
      toast({
        title: "Facture",
        description:
          "Mode facture sélectionné. (Tu peux garder ton flow existant ici.)",
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
      console.error("[PaymentModal] paystack error", err);
      toast({
        title: commonT("error.somethingWentWrong"),
        description:
          err?.message || "Erreur lors de l'initialisation Paystack.",
        variant: "destructive",
      });
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <>
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
                    {paymentModalT("summarySection.creditsLabel")} {credits}{" "}
                    Crédits
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>{paymentModalT("summarySection.pricePerCredit")}</span>
                  <span>
                    {currency === "USD" ? "$" : ""}
                    {unitPrice}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-lg">
                  <span>{paymentModalT("summarySection.totalHT")}</span>
                  <span>
                    {currency === "USD" ? "$" : ""}
                    {(credits * unitPrice).toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                {paymentModalT("summarySection.disclaimer")}
              </p>

              {prepared?.purchase ? (
                <div className="rounded-md border border-gray-200 bg-white p-2 text-xs text-gray-700">
                  Dernière préparation:{" "}
                  <strong>{prepared.purchase.providerRef}</strong>
                  <div className="mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8"
                      onClick={() => setPayloadOpen(true)}
                    >
                      Voir payload Paystack
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Form */}
            <div className="space-y-6 p-6">
              <h2 className="text-lg font-bold">
                {paymentModalT("paymentMethodSection.title")}
              </h2>

              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as any)}
                className="flex space-x-4"
              >
                <div
                  className={`flex items-center space-x-2 border rounded-md py-2 px-3 flex-1 cursor-pointer ${
                    paymentMethod === "paystack"
                      ? "border-2 border-appinio-blue"
                      : "border-gray-200"
                  }`}
                  onClick={() => setPaymentMethod("paystack")}
                >
                  <RadioGroupItem value="paystack" id="paystack" />
                  <Label
                    htmlFor="paystack"
                    className="font-medium cursor-pointer"
                  >
                    Paystack
                  </Label>
                </div>

                <div
                  className={`flex items-center space-x-2 border rounded-md py-2 px-3 flex-1 cursor-pointer ${
                    paymentMethod === "invoice"
                      ? "border-2 border-appinio-blue"
                      : "border-gray-200"
                  }`}
                  onClick={() => setPaymentMethod("invoice")}
                >
                  <RadioGroupItem value="invoice" id="invoice" />
                  <Label
                    htmlFor="invoice"
                    className="font-medium cursor-pointer"
                  >
                    {paymentModalT("paymentMethodSection.invoice")}
                  </Label>
                </div>
              </RadioGroup>

              {/* ---- FORM ---- */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="civility">
                    {paymentModalT("form.civility")}
                  </Label>
                  <Select
                    value={civility}
                    onValueChange={(value) =>
                      setField("civility", value as any)
                    }
                  >
                    <SelectTrigger id="civility" className="h-9">
                      <SelectValue
                        placeholder={paymentModalT("form.civility")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m">{formT("civility.mr")}</SelectItem>
                      <SelectItem value="mme">
                        {formT("civility.mrs")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lastName">
                    {paymentModalT("form.firstName")}
                  </Label>
                  <Input
                    id="lastName"
                    placeholder={paymentModalT("form.firstName")}
                    value={lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="firstName">
                    {paymentModalT("form.lastName")}
                  </Label>
                  <Input
                    id="firstName"
                    placeholder={paymentModalT("form.lastName")}
                    value={firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    className="h-9"
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
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="country">
                    {paymentModalT("form.country")}
                  </Label>
                  <Select
                    value={country}
                    onValueChange={(value) => setField("country", value)}
                  >
                    <SelectTrigger id="country" className="h-9">
                      <SelectValue
                        placeholder={paymentModalT("form.country")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="germany">
                        {countriesT("germany")}
                      </SelectItem>
                      <SelectItem value="france">
                        {countriesT("france")}
                      </SelectItem>
                      <SelectItem value="usa">{countriesT("usa")}</SelectItem>
                      <SelectItem value="ivoryCoast">
                        {countriesT("ivoryCoast")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 col-span-2">
                  <Label htmlFor="company">
                    {paymentModalT("form.company")}
                  </Label>
                  <Input
                    id="company"
                    placeholder={paymentModalT("form.company")}
                    value={company}
                    onChange={(e) => setField("company", e.target.value)}
                    className="h-9"
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
                disabled={
                  !isFormValid ||
                  loadingCheckout ||
                  isPreparing ||
                  isInitializing
                }
              >
                {loadingCheckout || isPreparing || isInitializing ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isPreparing
                      ? "Préparation..."
                      : isInitializing
                        ? "Redirection Paystack..."
                        : "Chargement..."}
                  </span>
                ) : (
                  paymentModalT("buyCreditsButton", { credits })
                )}
              </Button>

              <div className="text-xs text-gray-500">
                Paystack initialize requiert <code>email</code> +{" "}
                <code>amount</code> (subunit) et renvoie une{" "}
                <code>authorization_url</code>.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payload preview dialog */}
      <Dialog open={payloadOpen} onOpenChange={setPayloadOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payload Paystack (preview)</DialogTitle>
          </DialogHeader>

          {prepared ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-700">
                Purchase ID: <strong>{prepared.purchase.id}</strong>
                <br />
                Reference: <strong>{prepared.purchase.providerRef}</strong>
              </div>

              <pre className="max-h-[420px] overflow-auto rounded-md bg-gray-900 p-3 text-xs text-gray-100">
                {JSON.stringify(
                  { purchase: prepared.purchase, paystack: prepared.paystack },
                  null,
                  2,
                )}
              </pre>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPayloadOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">Aucun payload.</div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
