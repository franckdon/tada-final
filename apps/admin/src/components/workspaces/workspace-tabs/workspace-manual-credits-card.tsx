"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";
import { Badge } from "@tada/ui/components/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import CreditsInvoiceDownloadButton from "../credits-invoice-download-button";

type Direction = "credit" | "debit";
type CreditAddMode = "gift" | "paid";

type PaymentMethod = "cash" | "cheque" | "bank_transfer" | "mobile_money";

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "cash", label: "Espèce" },
  { value: "cheque", label: "Chèque" },
  { value: "bank_transfer", label: "Virement" },
  { value: "mobile_money", label: "Mobile Money" },
];

// Packs + possibilité personnalisé
const CREDIT_PACK_OPTIONS = [1, 5, 10, 20, 50, 100, 200, 250, 300] as const;
type CreditQtyValue = (typeof CREDIT_PACK_OPTIONS)[number] | "custom";

function formatXof(n: number) {
  const value = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function WorkspaceManualCreditsCard({
  workspaceId,
  currentCredits,
  onApplied,
}: {
  workspaceId: string;
  currentCredits: number;
  onApplied?: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [direction, setDirection] = React.useState<Direction>("credit");

  // debit (retrait): input libre
  const [debitAmount, setDebitAmount] = React.useState<string>("");

  // credit (ajout): select packs + custom + mode gift/paid
  const [creditQtyValue, setCreditQtyValue] = React.useState<CreditQtyValue>(
    CREDIT_PACK_OPTIONS[0],
  );
  const [customCreditQty, setCustomCreditQty] = React.useState<string>("");
  const [addMode, setAddMode] = React.useState<CreditAddMode>("gift");

  // paid fields
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod | "">(
    "",
  );
  const [amountXof, setAmountXof] = React.useState<number>(0);

  const [note, setNote] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);

  // last invoice (paid only)
  const [lastInvoiceId, setLastInvoiceId] = React.useState<string | null>(null);

  const parsedDebitAmount = React.useMemo(() => {
    const n = Number.parseInt(debitAmount, 10);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, n);
  }, [debitAmount]);

  const effectiveCreditQty = React.useMemo(() => {
    if (creditQtyValue === "custom") {
      const n = Math.floor(Number(customCreditQty ?? 0));
      return Number.isFinite(n) ? n : 0;
    }
    return Number(creditQtyValue);
  }, [creditQtyValue, customCreditQty]);

  const willOverdraw =
    direction === "debit" && parsedDebitAmount > currentCredits;

  React.useEffect(() => {
    // reset invoice when mode changes
    setLastInvoiceId(null);

    if (addMode === "gift") {
      setPaymentMethod("");
      setAmountXof(0);
    }
  }, [addMode]);

  React.useEffect(() => {
    setLastInvoiceId(null);

    if (direction === "debit") {
      setPaymentMethod("");
      setAmountXof(0);
      setCreditQtyValue(CREDIT_PACK_OPTIONS[0]);
      setCustomCreditQty("");
      setAddMode("gift");
    }
  }, [direction]);

  React.useEffect(() => {
    // si on change qty => on invalide la dernière facture
    setLastInvoiceId(null);
  }, [creditQtyValue, customCreditQty, amountXof, paymentMethod]);

  const validate = () => {
    if (direction === "debit") {
      if (parsedDebitAmount <= 0) return "Le montant à retirer doit être > 0.";
      if (willOverdraw)
        return "Débit impossible : montant supérieur au solde actuel.";
      return null;
    }

    // credit
    if (!Number.isFinite(effectiveCreditQty) || effectiveCreditQty <= 0) {
      return "Le nombre de crédits doit être > 0.";
    }

    if (addMode === "paid") {
      if (!paymentMethod) return "La méthode de paiement est obligatoire.";
      if (!Number.isFinite(amountXof) || amountXof <= 0) {
        return "Le montant est obligatoire et doit être > 0.";
      }
    }

    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) {
      toast({ title: "Erreur", description: err, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      if (direction === "debit") {
        const res = await fetch(
          `/api/workspaces/${workspaceId}/credits/manual`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              direction: "debit",
              amount: parsedDebitAmount,
              note: note.trim() || null,
            }),
          },
        );

        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || "Operation failed");

        toast({
          title: "Crédits retirés",
          description: `-${parsedDebitAmount} crédits appliqués.`,
        });

        setDebitAmount("");
        setNote("");
        setLastInvoiceId(null);
      } else {
        // credit
        if (addMode === "gift") {
          // geste commercial: pas de facture
          const res = await fetch(
            `/api/workspaces/${workspaceId}/credits/manual`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                direction: "credit",
                amount: effectiveCreditQty,
                note: note.trim() || "Geste commercial",
                kind: "gift",
              }),
            },
          );

          const json = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(json?.error || "Operation failed");

          toast({
            title: "Crédits ajoutés",
            description: `+${effectiveCreditQty} crédits (geste commercial).`,
          });

          setNote("");
          setLastInvoiceId(null);
        } else {
          // paid topup -> facture
          const res = await fetch(
            `/api/workspaces/${workspaceId}/credits/purchase`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                creditsQty: effectiveCreditQty,
                paymentMethod,
                amountXof,
                note: note.trim() || null,
              }),
            },
          );

          const json = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(json?.error || "Paiement échoué");

          const invoiceId = json?.invoiceId ?? null;
          setLastInvoiceId(invoiceId);

          toast({
            title: "Crédits ajoutés + facture",
            description: `+${effectiveCreditQty} crédits. Facture générée.`,
          });

          setNote("");
        }
      }

      router.refresh();
      onApplied?.();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showInvoiceButton =
    direction === "credit" && addMode === "paid" && Boolean(lastInvoiceId);

  const disableSubmit =
    isLoading ||
    (direction === "debit" && (parsedDebitAmount <= 0 || willOverdraw)) ||
    (direction === "credit" &&
      (!effectiveCreditQty || effectiveCreditQty <= 0)) ||
    (direction === "credit" &&
      addMode === "paid" &&
      (!paymentMethod || amountXof <= 0));

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Crédits (hors forfait)</div>
          <div className="text-lg font-semibold text-gray-900">
            Ajout / retrait manuel
          </div>
        </div>

        <Badge variant="outline">
          Solde:{" "}
          <span className="ml-1 font-semibold">
            {new Intl.NumberFormat("fr-FR").format(currentCredits)}
          </span>
        </Badge>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={direction === "credit" ? "default" : "outline"}
            onClick={() => setDirection("credit")}
            className="h-10"
          >
            Ajouter (crédit)
          </Button>
          <Button
            type="button"
            variant={direction === "debit" ? "destructive" : "outline"}
            onClick={() => setDirection("debit")}
            className="h-10"
          >
            Retirer (débit)
          </Button>

          <div className="ml-auto">
            <CreditsInvoiceDownloadButton
              workspaceId={workspaceId}
              enabled={showInvoiceButton}
              invoiceId={showInvoiceButton ? lastInvoiceId : null}
            />
          </div>
        </div>

        {direction === "credit" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nombre de crédits à ajouter</Label>

              <Select
                value={String(creditQtyValue)}
                onValueChange={(v) =>
                  setCreditQtyValue(
                    v === "custom" ? "custom" : (Number(v) as any),
                  )
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_PACK_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} crédits
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Personnalisé…</SelectItem>
                </SelectContent>
              </Select>

              {creditQtyValue === "custom" ? (
                <div className="mt-2 space-y-2">
                  <Label className="text-xs text-gray-600">
                    Valeur personnalisée
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={customCreditQty}
                    onChange={(e) => setCustomCreditQty(e.target.value)}
                    className="h-11"
                    placeholder="Ex: 220"
                  />
                </div>
              ) : null}

              <div className="text-xs text-gray-500">
                Valeur retenue:{" "}
                <span className="font-semibold text-gray-900">
                  {effectiveCreditQty || "—"}
                </span>{" "}
                crédits
              </div>
            </div>

            <div className="space-y-2">
              <Label>Type d’ajout</Label>
              <Select
                value={addMode}
                onValueChange={(v) => setAddMode(v as CreditAddMode)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gift">
                    Geste commercial (pas de facture)
                  </SelectItem>
                  <SelectItem value="paid">Paiement (facture)</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-xs text-gray-500">
                {addMode === "gift"
                  ? "Aucune facture générée."
                  : "Une facture est générée après validation."}
              </div>
            </div>

            {addMode === "paid" ? (
              <>
                <div className="space-y-2">
                  <Label>Méthode de paiement</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Montant (XOF)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={amountXof}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setAmountXof(Number.isFinite(v) ? v : 0);
                    }}
                    className="h-11"
                    placeholder="Ex: 90000"
                  />
                  <div className="text-xs text-gray-500">
                    Valeur actuelle:{" "}
                    <span className="font-semibold text-gray-900">
                      {formatXof(amountXof)}
                    </span>
                  </div>
                </div>
              </>
            ) : null}

            <div className="space-y-2 md:col-span-2">
              <Label>Note (optionnel)</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-11"
                placeholder="Ex: geste commercial, correction..."
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Montant</Label>
              <Input
                type="number"
                min={1}
                step={1}
                value={debitAmount}
                onChange={(e) => setDebitAmount(e.target.value)}
                className="h-11"
                placeholder="Ex: 100"
              />
              {willOverdraw ? (
                <div className="text-xs text-red-600">
                  Débit impossible : montant supérieur au solde actuel.
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Note (optionnel)</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-11"
                placeholder="Ex: correction..."
              />
            </div>
          </div>
        )}

        <Button
          className="h-11 w-full"
          onClick={submit}
          disabled={disableSubmit}
        >
          {isLoading
            ? "En cours..."
            : direction === "credit"
              ? addMode === "gift"
                ? "Ajouter des crédits (geste commercial)"
                : "Ajouter des crédits (paiement + facture)"
              : "Retirer des crédits"}
        </Button>

        <div className="text-xs text-gray-500">
          {direction === "credit"
            ? addMode === "gift"
              ? "Ajout gratuit : aucune facture."
              : "Ajout payant : facture générée après validation."
            : "Retrait : opération manuelle."}
        </div>
      </div>
    </div>
  );
}
