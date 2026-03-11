"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { Textarea } from "@tada/ui/components/textarea";
import { Label } from "@tada/ui/components/label";
import { Badge } from "@tada/ui/components/badge";
import { Separator } from "@tada/ui/components/separator";
import { Check, X, Loader2, Wallet, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAction } from "next-safe-action/hooks";
import { addCommentToSubmissionAction } from "@/actions/contributors/add-comment-to-submission-action";
import { getSubmissionValidationPreviewAction } from "@/actions/contributors/get-submission-validation-preview-action";
import { useI18n } from "@/locales/client";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface ValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  responseId: string;
  action: "approve" | "reject" | null;
  missionId: string;
}

type ValidationPreview = {
  surveyResponseId: string;
  mission: {
    id: string;
    name: string;
  };
  workspace: {
    id: string;
    name: string;
  };
  account: {
    id: string | null;
    balance: number;
    currency: string;
  };
  pricing: {
    activePlanCode: "starter" | "growth" | "business" | "entreprise" | null;
    activePlanLabel: string;
    requiredCredits: number;
  };
  result: {
    hasEnoughCredits: boolean;
    remainingAfterApproval: number;
  };
};

function formatPlanLabel(
  planCode: "starter" | "growth" | "business" | "entreprise" | null,
) {
  if (!planCode) return "Aucun plan actif";
  if (planCode === "starter") return "Starter";
  if (planCode === "growth") return "Growth";
  if (planCode === "business") return "Business";
  if (planCode === "entreprise") return "Entreprise";
  return "Aucun plan actif";
}

export function ValidationDialog({
  open,
  onOpenChange,
  responseId,
  action,
  missionId,
}: ValidationDialogProps) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<ValidationPreview | null>(null);

  const t = useI18n();
  const { data: session } = useSession();
  const router = useRouter();

  const previewAction = useAction(getSubmissionValidationPreviewAction, {
    onSuccess: (res) => {
      const data = res?.data as ValidationPreview | undefined;
      setPreview(data ?? null);
    },
    onError: ({ error }) => {
      console.error("preview error", error);
      setPreview(null);
      toast({
        title: "Impossible de charger le détail des crédits du workspace",
        variant: "destructive",
      });
    },
  });

  const addCommentToSubmission = useAction(addCommentToSubmissionAction, {
    onSuccess: (res) => {
      const data = res?.data as
        | {
            success?: boolean;
            error?: string;
            workspaceCharge?: {
              debited: boolean;
              alreadyDebited: boolean;
              requiredCredits: number;
              workspaceBalanceBefore: number;
              workspaceBalanceAfter: number;
            };
          }
        | undefined;

      if (!data?.success) {
        toast({
          title: data?.error || t("common.notifications.error.save"),
          variant: "destructive",
        });
        return;
      }

      const workspaceCharge = data.workspaceCharge;

      if (action === "approve" && workspaceCharge) {
        toast({
          title: "Soumission approuvée",
          description: workspaceCharge.alreadyDebited
            ? "Le débit du workspace avait déjà été appliqué auparavant."
            : `${workspaceCharge.requiredCredits} crédits ont été débités du workspace. Solde restant: ${workspaceCharge.workspaceBalanceAfter}`,
        });
      } else {
        toast({
          title: t("common.notifications.success.save"),
        });
      }

      onOpenChange(false);
      setComment("");
      setError("");
      setPreview(null);
      router.refresh();
    },
    onError: ({ error }) => {
      console.log("error", error);
      toast({
        title: t("common.notifications.error.save"),
        variant: "destructive",
      });
    },
  });

  const { isExecuting, execute } = addCommentToSubmission;
  const { execute: loadPreview, isExecuting: isPreviewLoading } = previewAction;

  useEffect(() => {
    if (!open) {
      setPreview(null);
      setComment("");
      setError("");
      return;
    }

    if (action === "approve") {
      loadPreview({ surveyResponseId: responseId });
    } else {
      setPreview(null);
    }
  }, [open, action, responseId, loadPreview]);

  const isApproval = action === "approve";
  const hasEnoughCredits = preview?.result.hasEnoughCredits ?? false;
  const mustBlockApproval =
    isApproval && (!preview || isPreviewLoading || !hasEnoughCredits);

  const approveLabel = useMemo(() => {
    if (!isApproval) return "Valider";
    if (isPreviewLoading) return "Chargement...";
    if (preview?.pricing.requiredCredits) {
      return `Approuver et débiter ${preview.pricing.requiredCredits} crédits`;
    }
    return "Approuver";
  }, [isApproval, isPreviewLoading, preview]);

  const getTitle = () => {
    switch (action) {
      case "approve":
        return "Approuver la soumission";
      case "reject":
        return "Rejeter la soumission";
      default:
        return "Validation";
    }
  };

  const getDescription = () => {
    switch (action) {
      case "approve":
        return "Vous êtes sur le point d'approuver cette soumission. Le débit du workspace sera appliqué au moment de la validation.";
      case "reject":
        return "Vous êtes sur le point de rejeter cette soumission. Veuillez expliquer les raisons du rejet pour aider le contributeur.";
      default:
        return "";
    }
  };

  const getIcon = () => {
    switch (action) {
      case "approve":
        return <Check className="h-5 w-5 text-green-600" />;
      case "reject":
        return <X className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const handleValidation = () => {
    if (action === "reject" && !comment.trim()) {
      setError("Le commentaire est requis pour un rejet.");
      return;
    }

    if (action === "approve" && mustBlockApproval) {
      setError(
        preview && !preview.result.hasEnoughCredits
          ? "Crédit du workspace insuffisant pour approuver cette soumission."
          : "Le détail des crédits du workspace est encore en chargement.",
      );
      return;
    }

    setError("");
    execute({
      id: responseId,
      comment,
      action: action === "reject" ? "rejected" : "approved",
      validatorId: session?.user.id!,
      missionId,
      surveyResponseId: responseId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {action === "approve" && (
            <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <h4 className="font-medium text-sm">
                  Détail des crédits du workspace
                </h4>
              </div>

              {isPreviewLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement des crédits du workspace...
                </div>
              ) : preview ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border bg-background p-3">
                      <div className="text-muted-foreground text-xs mb-1">
                        Workspace
                      </div>
                      <div className="font-medium">
                        {preview.workspace.name}
                      </div>
                    </div>

                    <div className="rounded-lg border bg-background p-3">
                      <div className="text-muted-foreground text-xs mb-1">
                        Plan actif
                      </div>
                      <div className="font-medium">
                        {formatPlanLabel(preview.pricing.activePlanCode)}
                      </div>
                    </div>

                    <div className="rounded-lg border bg-background p-3">
                      <div className="text-muted-foreground text-xs mb-1">
                        Crédits disponibles
                      </div>
                      <div className="font-medium">
                        {preview.account.balance}
                      </div>
                    </div>

                    <div className="rounded-lg border bg-background p-3">
                      <div className="text-muted-foreground text-xs mb-1">
                        Débit après validation
                      </div>
                      <div className="font-medium text-red-600">
                        -{preview.pricing.requiredCredits}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        Solde après validation :
                      </span>{" "}
                      <span
                        className={
                          preview.result.hasEnoughCredits
                            ? "font-semibold text-green-600"
                            : "font-semibold text-red-600"
                        }
                      >
                        {preview.result.remainingAfterApproval}
                      </span>
                    </div>

                    {preview.result.hasEnoughCredits ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Crédit suffisant
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Crédit du workspace insuffisant
                      </Badge>
                    )}
                  </div>

                  {!preview.result.hasEnoughCredits && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      Le workspace ne dispose pas d’assez de crédits pour
                      valider cette soumission.
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  Impossible de charger le détail des crédits du workspace.
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="comment">
              Commentaire{" "}
              {action === "reject" ? "(obligatoire)" : "(optionnel)"}
            </Label>
            <Textarea
              id="comment"
              placeholder={
                action === "approve"
                  ? "Ajoutez un commentaire positif (optionnel)."
                  : "Expliquez les raisons du rejet (obligatoire)."
              }
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError("");
              }}
              className="mt-2"
              rows={10}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setComment("");
              setError("");
              setPreview(null);
            }}
            disabled={isExecuting}
          >
            Annuler
          </Button>

          <Button
            onClick={handleValidation}
            disabled={isExecuting || mustBlockApproval}
            className={
              action === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {(isExecuting || isPreviewLoading) && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {action === "approve" ? approveLabel : "Rejeter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
