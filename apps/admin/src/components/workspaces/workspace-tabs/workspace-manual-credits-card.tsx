"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";
import { Badge } from "@tada/ui/components/badge";
import { useToast } from "@/hooks/use-toast";

type Direction = "credit" | "debit";

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
  const [amount, setAmount] = React.useState<string>("");
  const [note, setNote] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);

  const parsedAmount = React.useMemo(() => {
    const n = Number.parseInt(amount, 10);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, n);
  }, [amount]);

  const willOverdraw = direction === "debit" && parsedAmount > currentCredits;

  const submit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/credits/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction,
          amount: parsedAmount,
          note: note.trim() || null,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Operation failed");

      toast({
        title: direction === "credit" ? "Crédits ajoutés" : "Crédits retirés",
        description:
          direction === "credit"
            ? `+${parsedAmount} crédits appliqués.`
            : `-${parsedAmount} crédits appliqués.`,
      });

      setAmount("");
      setNote("");

      // 1) refresh serveur (solde, etc.)
      router.refresh();

      // 2) refresh client (table transactions)
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

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Crédits (manuel)</div>
          <div className="text-lg font-semibold text-gray-900">
            Ajout / retrait hors forfait
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
        <div className="flex flex-wrap gap-2">
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
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Montant</Label>
            <Input
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
              placeholder="Ex: geste commercial, correction..."
            />
          </div>
        </div>

        <Button
          className="h-11 w-full"
          onClick={submit}
          disabled={isLoading || parsedAmount <= 0 || willOverdraw}
        >
          {isLoading
            ? "En cours..."
            : direction === "credit"
              ? "Ajouter des crédits"
              : "Retirer des crédits"}
        </Button>

        <div className="text-xs text-gray-500">
          Cette opération crée une transaction (
          {direction === "credit" ? "manual_grant" : "manual_withdraw"}) visible
          dans l’historique.
        </div>
      </div>
    </div>
  );
}
