"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { Button } from "@tada/ui/components/button";
import { useRouter } from "next/navigation";

type Reason = "no_plan" | "low_credits";

export function UpgradeRequiredModal({
  open,
  onOpenChange,
  locale,
  reason,
  balance,
  minCredits,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  locale: string;
  reason: Reason;
  balance: number;
  minCredits: number;
}) {
  const router = useRouter();

  const title =
    reason === "no_plan" ? "Forfait requis" : "Crédits insuffisants";

  const description =
    reason === "no_plan"
      ? "Vous devez activer un forfait pour créer une mission."
      : `Vous avez ${balance} crédits. Il vous faut au moins ${minCredits} crédits pour créer une mission.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">{description}</p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                onOpenChange(false);
                router.push(`/${locale}/pricing`);
              }}
            >
              Voir les forfaits
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
