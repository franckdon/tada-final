"use client";

import { useState } from "react";
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
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAction } from "next-safe-action/hooks";
import { addCommentToSubmissionAction } from "@/actions/contributors/add-comment-to-submission-action";
import { useI18n } from "@/locales/client";
import { useSession } from "@/lib/auth-client";

interface ValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  responseId: string;
  action: "approve" | "reject" | null;
  missionId: string;
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

  const t = useI18n();
  const { data: session } = useSession();

  const addCommentToSubmission = useAction(addCommentToSubmissionAction, {
    onSuccess: () => {
      toast({
        title: t("common.notifications.success.save"),
      });
      onOpenChange(false);
      setComment("");
    },
    onError: ({ error }) => {
      console.log("error", error);
      toast({ title: t("common.notifications.error.save") });
    },
  });

  const { isExecuting, execute } = addCommentToSubmission;

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
        return "Vous êtes sur le point d'approuver cette soumission. Vous pouvez ajouter un commentaire pour expliquer votre décision.";
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
        <div className="space-y-4">
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
                if (error) setError(""); // reset si l’utilisateur commence à taper
              }}
              className="mt-2"
              rows={10}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setComment("");
            }}
            disabled={isExecuting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleValidation}
            disabled={isExecuting}
            className={
              action === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {isExecuting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {action === "approve" ? "Approuver" : "Rejeter"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
