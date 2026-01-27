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

import * as React from "react";
import { Loader2 } from "lucide-react";

import { useBillingStore } from "@/hooks/use-billing-store";
import { useScopedI18n, useCurrentLocale } from "@/locales/client";
import { toast } from "@/hooks/use-toast";
import { useSession } from "@/lib/auth-client";

import { useWorkspaceCreditsPurchaseStore } from "@/hooks/use-workspace-credits-purchase-store";
import type { PlanCode } from "@/lib/plans/plan-limits";

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
      amount: number; // cents
      currency?: string;
      callback_url?: string;
      metadata?: any;
      channels?: string[];
    };
    // plus tard tu pourras ajouter:
    // authorization_url?: string;
    // access_code?: string;
  };
};

interface PaymentModalProps {
  open: boolean;
  onOpenChange: () => void;
  inComingredits: number;
  workspaceId: string;

  // ✅ nouveau
  prepared?: PrepareResponse | null;
}

function validateBilling(fields: {
  acceptTerms: boolean;
  firstName: string;
  lastName: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  company: string;
}) {
  const {
    acceptTerms,
    firstName,
    lastName,
    street,
    zip,
    city,
    country,
    company,
  } = fields;

  if (!acceptTerms) return "Veuillez accepter les CGU.";
  if (!firstName || !lastName) return "Nom et prénom requis.";
  if (!street || !zip || !city || !country) return "Adresse incomplète.";
  if (!company) return "Entreprise requise.";
  return null;
}

export function PaymentModal({
  open,
  onOpenChange,
  inComingredits,
  workspaceId,
  prepared,
}: PaymentModalProps) {
  const commonT = useScopedI18n("common");
  const paymentModalT = useScopedI18n("paymentModal");
  const countriesT = useScopedI18n("countries");
  const formT = useScopedI18n("form");
  const locale = useCurrentLocale();
  const { data: session } = useSession();

  const [submitting, setSubmitting] = React.useState(false);

  // invoice | paystack
  const [paymentMethod, setPaymentMethod] = React.useState<
    "invoice" | "paystack"
  >("paystack");

  // payload preview
  const [paystackPreviewOpen, setPaystackPreviewOpen] = React.useState(false);
  const [paystackPrepared, setPaystackPrepared] =
    React.useState<PrepareResponse | null>(prepared ?? null);

  React.useEffect(() => {
    // keep latest prepared snapshot when modal opens again
    setPaystackPrepared(prepared ?? null);
  }, [prepared]);

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

  const effectiveWorkspaceId = storeWorkspaceId || workspaceId;

  const totalUi = (credits * unitPrice).toFixed(2);

  // ---------- Paystack (Step 2: initialize READY) ----------
  const ensurePaystackPrepared = async (): Promise<PrepareResponse> => {
    // Prefer prepared passed from CreditsModal
    if (paystackPrepared?.purchase?.providerRef) return paystackPrepared;

    // Fallback: call initialize to create pending + payload
    const email = String(session?.user?.email ?? "").trim();
    if (!email) throw new Error("Email utilisateur manquant pour Paystack.");

    const unitPriceUsdCents = Math.round(unitPrice * 100);

    const res = await fetch(
      `/api/workspaces/${effectiveWorkspaceId}/credits/purchase/initialize`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits,
          unitPriceUsd: unitPriceUsdCents,
          planCode: null, // si tu veux, passe planCode ici depuis header/store
          email,
        }),
      },
    );

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error || "Impossible de préparer Paystack.");
    }

    // IMPORTANT: ton route.ts renvoie { ok, purchase, paystack: { payload } }
    // On le remappe au type PrepareResponse
    const mapped: PrepareResponse = {
      purchase: {
        id: json.purchase.id,
        workspaceId: json.purchase.workspaceId,
        organizationId: json.purchase.organizationId,
        planCode: json.purchase.planCode ?? null,
        credits: json.purchase.credits,
        unitPriceUsdCents: json.purchase.unitPriceUsd,
        totalAmountUsdCents: json.purchase.totalAmountUsd,
        currency: "USD",
        provider: "paystack",
        providerRef: json.purchase.providerRef,
        providerStatus: json.purchase.providerStatus,
        metadata: json.purchase.metadata,
        createdAt: json.purchase.createdAt,
        updatedAt: json.purchase.createdAt,
      },
      paystack: {
        payload: json.paystack.payload,
      },
    };

    setPaystackPrepared(mapped);
    return mapped;
  };

  const handlePaystackCheckout = async () => {
    setSubmitting(true);
    try {
      // validate billing
      const errMsg = validateBilling({
        acceptTerms: Boolean(acceptTerms),
        firstName,
        lastName,
        street,
        zip,
        city,
        country,
        company,
      });
      if (errMsg) throw new Error(errMsg);

      if (!effectiveWorkspaceId) {
        throw new Error("Workspace introuvable. Veuillez réessayer.");
      }
      if (credits <= 0) {
        throw new Error("Veuillez sélectionner un nombre de crédits valide.");
      }

      const prepared = await ensurePaystackPrepared();

      // show payload preview (UI-only)
      setPaystackPreviewOpen(true);

      // Si plus tard tu renvoies authorization_url depuis ton API,
      // tu pourras faire:
      // if ((prepared.paystack as any).authorization_url) window.location.href = ...
    } catch (e: any) {
      toast({
        title: commonT("error.somethingWentWrong"),
        description: e?.message ?? "Erreur lors de la préparation Paystack",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Invoice (existing) ----------
  const handleInvoiceRequest = async () => {
    setSubmitting(true);
    try {
      const errMsg = validateBilling({
        acceptTerms: Boolean(acceptTerms),
        firstName,
        lastName,
        street,
        zip,
        city,
        country,
        company,
      });
      if (errMsg) throw new Error(errMsg);

      if (!effectiveWorkspaceId) {
        throw new Error("Workspace introuvable. Veuillez réessayer.");
      }
      if (credits <= 0) {
        throw new Error("Veuillez sélectionner un nombre de crédits valide.");
      }

      // Garde ta logique existante si tu veux créer une "invoice request"
      // Ici je conserve ton endpoint (mais tu peux le renommer)
      const requestId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const payload = {
        credits,
        unitPrice,
        currency: (currency || "usd").toLowerCase(),
        workspaceId: effectiveWorkspaceId,
        organizationId: organizationId || undefined,
        user: {
          id: session?.user?.id,
          email: session?.user?.email,
          name: session?.user?.name,
        },
        metadata: {
          requestId,
          balanceBefore: inComingredits,
          creditsPurchased: credits,
          balanceAfter: inComingredits + credits,
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
          workspaceId: effectiveWorkspaceId,
        },
      };

      const response = await fetch("/api/custom-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "Erreur lors de la création de la demande.",
        );
      }

      // ton endpoint retourne une url stripe dans ton ancien code.
      // Ici tu peux adapter selon ton "invoice flow".
      if (data?.url) window.location.href = data.url;

      toast({
        title: paymentModalT("title"),
        description: "Demande envoyée.",
      });
    } catch (e: any) {
      toast({
        title: commonT("error.somethingWentWrong"),
        description: e?.message ?? "Erreur serveur, veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const primaryAction = async () => {
    if (paymentMethod === "paystack") return handlePaystackCheckout();
    return handleInvoiceRequest();
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
                    {currency === "USD" ? "$" : currency} {unitPrice}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-lg">
                  <span>{paymentModalT("summarySection.totalHT")}</span>
                  <span>
                    {currency === "USD" ? "$" : currency} {totalUi}
                  </span>
                </div>

                {paystackPrepared?.purchase?.providerRef ? (
                  <div className="rounded-md border border-gray-200 bg-white p-2 text-xs text-gray-700 mt-3">
                    Reference:{" "}
                    <strong>{paystackPrepared.purchase.providerRef}</strong>
                  </div>
                ) : null}
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

              {/* billing form (inchangé) */}
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
                onClick={primaryAction}
                disabled={
                  !acceptTerms ||
                  !firstName ||
                  !lastName ||
                  !street ||
                  !zip ||
                  !city ||
                  !country ||
                  !company ||
                  submitting
                }
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : paymentMethod === "paystack" ? (
                  `Payer avec Paystack`
                ) : (
                  paymentModalT("buyCreditsButton", { credits })
                )}
              </Button>

              {paymentMethod === "paystack" ? (
                <div className="text-xs text-gray-500">
                  Paystack: on prépare la transaction et on affiche le payload
                  (step 2).
                </div>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Paystack payload preview */}
      <Dialog open={paystackPreviewOpen} onOpenChange={setPaystackPreviewOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Paystack — Payload (preview)</DialogTitle>
          </DialogHeader>

          {paystackPrepared ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-700">
                Purchase ID: <strong>{paystackPrepared.purchase.id}</strong>
                <br />
                Reference:{" "}
                <strong>{paystackPrepared.purchase.providerRef}</strong>
              </div>

              <pre className="max-h-[420px] overflow-auto rounded-md bg-gray-900 p-3 text-xs text-gray-100">
                {JSON.stringify(paystackPrepared.paystack.payload, null, 2)}
              </pre>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPaystackPreviewOpen(false)}
                >
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
