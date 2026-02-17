"use client";

import { useMemo, useState } from "react";
import { Button } from "@tada/ui/components/button";
import { Check, X } from "lucide-react";
import { ValidationDialog } from "./validation-dialog";

interface ValidationActionsProps {
  responseId: string;
  currentStatus: string; // "pending" | "approved" | "rejected"
  variant?: "compact" | "expanded";
  missionId: string;
}

export function ValidationActions({
  responseId,
  currentStatus,
  variant = "compact",
  missionId,
}: ValidationActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "approve" | "reject" | null
  >(null);

  const normalized = useMemo(
    () =>
      String(currentStatus ?? "")
        .trim()
        .toLowerCase(),
    [currentStatus],
  );

  console.log("[ValidationActions] render", {
    responseId,
    currentStatus,
    normalized,
    variant,
    missionId,
  });

  const handleAction = (action: "approve" | "reject") => {
    setSelectedAction(action);
    setDialogOpen(true);
  };

  // ✅ Visible uniquement si pending (validation humaine)
  if (normalized !== "pending") return null;

  if (variant === "compact") {
    return (
      <>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction("approve")}
            className="h-7 px-2 shadow-none"
          >
            <Check className="h-3 w-3" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction("reject")}
            className="h-7 px-2 shadow-none"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <ValidationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          responseId={responseId}
          action={selectedAction}
          missionId={missionId}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => handleAction("approve")}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="h-4 w-4" />
          Approuver
        </Button>

        <Button variant="destructive" onClick={() => handleAction("reject")}>
          <X className="h-4 w-4" />
          Rejeter
        </Button>
      </div>

      <ValidationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        responseId={responseId}
        action={selectedAction}
        missionId={missionId}
      />
    </>
  );
}
