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
  const [paymentMethod, setPaymentMethod] = useState("invoice");

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

  const handleSubmitBilling = async () => {
    console.log("[PaymentModal] submit clicked", {
      credits,
      unitPrice,
      storeWorkspaceId,
      propWorkspaceId: workspaceId,
      effectiveWorkspaceId,
      organizationId,
      sessionUserId: session?.user?.id,
    });

    if (
      !acceptTerms ||
      !firstName ||
      !lastName ||
      !street ||
      !zip ||
      !city ||
      !country
    ) {
      console.log("[PaymentModal] missing required fields");
      toast({
        title: commonT("error.somethingWentWrong"),
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    if (!effectiveWorkspaceId || effectiveWorkspaceId.trim().length === 0) {
      console.log("[PaymentModal] missing workspaceId");
      toast({
        title: commonT("error.somethingWentWrong"),
        description: "Workspace introuvable. Veuillez réessayer.",
        variant: "destructive",
      });
      return;
    }

    if (credits <= 0) {
      console.log("[PaymentModal] invalid credits", credits);
      toast({
        title: commonT("error.somethingWentWrong"),
        description: "Veuillez sélectionner un nombre de crédits valide.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod !== "invoice") {
      toast({
        title: "Moyen de paiement non disponible",
        description:
          "Le paiement via PayPal n'est pas encore implémenté. Veuillez choisir une autre méthode.",
        variant: "destructive",
      });
      return;
    }

    setLoadingCheckout(true);

    const requestId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const payload = {
      credits,
      unitPrice,
      currency: (currency || "eur").toLowerCase(),
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

    console.log(
      "[PaymentModal] POST /api/custom-checkout-session payload",
      payload
    );

    try {
      const response = await fetch("/api/custom-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[PaymentModal] response status", response.status);

      const data = await response.json().catch(() => null);
      console.log("[PaymentModal] response body", data);

      if (!response.ok) {
        toast({
          title: commonT("error.somethingWentWrong"),
          description: data?.error || "Erreur lors de la création du paiement",
          variant: "destructive",
        });
        setLoadingCheckout(false);
        return;
      }

      if (!data?.url) {
        toast({
          title: commonT("error.somethingWentWrong"),
          description: "URL de paiement manquante (Stripe).",
          variant: "destructive",
        });
        setLoadingCheckout(false);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("[PaymentModal] network error", error);
      toast({
        title: commonT("error.somethingWentWrong"),
        description: "Erreur serveur, veuillez réessayer.",
        variant: "destructive",
      });
      setLoadingCheckout(false);
    }
  };

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
                  {paymentModalT("summarySection.creditsLabel")} {credits}{" "}
                  Crédits
                </span>
              </div>
              <div className="flex justify-between">
                <span>{paymentModalT("summarySection.pricePerCredit")}</span>
                <span>€ {unitPrice}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>{paymentModalT("summarySection.totalHT")}</span>
                <span>{(credits * unitPrice).toFixed(2)} €</span>
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
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="flex space-x-4"
            >
              <div
                className={`flex items-center space-x-2 border rounded-md py-2 px-3 flex-1 cursor-pointer ${
                  paymentMethod === "invoice"
                    ? "border-2 border-appinio-blue"
                    : "border-gray-200"
                }`}
                onClick={() => setPaymentMethod("invoice")}
              >
                <RadioGroupItem value="invoice" id="invoice" />
                <Label htmlFor="invoice" className="font-medium cursor-pointer">
                  {paymentModalT("paymentMethodSection.invoice")}
                </Label>
              </div>
              <div
                className={`flex items-center space-x-2 border rounded-md py-2 px-3 flex-1 cursor-pointer ${
                  paymentMethod === "paypal"
                    ? "border-2 border-appinio-blue"
                    : "border-gray-200"
                }`}
                onClick={() => setPaymentMethod("paypal")}
              >
                <RadioGroupItem value="paypal" id="paypal" />
                <Label
                  htmlFor="paypal"
                  className="font-medium flex items-center gap-2 cursor-pointer"
                >
                  {paymentModalT("paymentMethodSection.payWith")}{" "}
                </Label>
              </div>
            </RadioGroup>

            {/* ---- FORM (inchangé) ---- */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="civility">
                  {paymentModalT("form.civility")}
                </Label>
                <Select
                  value={civility}
                  onValueChange={(value) => setField("civility", value as any)}
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
                <Label htmlFor="country">{paymentModalT("form.country")}</Label>
                <Select
                  value={country}
                  onValueChange={(value) => setField("country", value)}
                >
                  <SelectTrigger id="country" className="h-9">
                    <SelectValue placeholder={paymentModalT("form.country")} />
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
                <Label htmlFor="company">{paymentModalT("form.company")}</Label>
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
              onClick={handleSubmitBilling}
              disabled={
                !acceptTerms ||
                !firstName ||
                !lastName ||
                !street ||
                !zip ||
                !city ||
                !country ||
                loadingCheckout
              }
            >
              {loadingCheckout ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                paymentModalT("buyCreditsButton", { credits })
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
