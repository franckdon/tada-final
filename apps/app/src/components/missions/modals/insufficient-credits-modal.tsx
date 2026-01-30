"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { Button } from "@tada/ui/components/button";
import { useRouter } from "next/navigation";

export function InsufficientCreditsModal(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  locale: string;

  // credits
  balance: number;
  requiredCredits: number;

  // samples
  requestedSample: number;
  maxSample: number;
}) {
  const router = useRouter();

  const {
    open,
    onOpenChange,
    locale,
    balance,
    requiredCredits,
    requestedSample,
    maxSample,
  } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {locale === "fr" ? "Crédits insuffisants" : "Not enough credits"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
          <p>
            {locale === "fr"
              ? `Tu essaies de créer une mission avec ${requestedSample} participants.`
              : `You're trying to create a mission with ${requestedSample} participants.`}
          </p>

          <div className="rounded-md border bg-gray-50 dark:bg-gray-900 p-3 space-y-1">
            <div className="flex justify-between">
              <span>
                {locale === "fr" ? "Crédits requis" : "Credits required"}
              </span>
              <span className="font-semibold">{requiredCredits}</span>
            </div>
            <div className="flex justify-between">
              <span>
                {locale === "fr" ? "Crédits disponibles" : "Credits available"}
              </span>
              <span className="font-semibold">{balance}</span>
            </div>
          </div>

          <p>
            {locale === "fr"
              ? `Avec tes crédits actuels, tu peux interroger jusqu’à ${maxSample} participants (12 crédits / participant).`
              : `With your current credits, you can survey up to ${maxSample} participants (12 credits / participant).`}
          </p>

          <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {locale === "fr" ? "Fermer" : "Close"}
            </Button>

            <Button
              onClick={() => {
                onOpenChange(false);
                router.push(`/${locale}/pricing`);
              }}
            >
              {locale === "fr" ? "Voir les plans" : "See pricing"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
