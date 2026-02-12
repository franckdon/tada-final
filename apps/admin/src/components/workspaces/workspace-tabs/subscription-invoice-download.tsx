"use client";

import * as React from "react";
import { Button } from "@tada/ui/components/button";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionInvoiceDownloadButton({
  workspaceId,
  enabled,
}: {
  workspaceId: string;
  enabled: boolean;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const download = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/subscription/invoice`,
        {
          method: "GET",
        },
      );

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || "Impossible de télécharger la facture");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // essaye de récupérer le nom depuis Content-Disposition
      const cd = res.headers.get("content-disposition") || "";
      const match = cd.match(/filename="(.+?)"/);
      const filename = match?.[1] || "invoice.pdf";

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!enabled) return null;

  return (
    <Button
      variant="secondary"
      className="h-10"
      onClick={download}
      disabled={loading}
    >
      {loading ? "Téléchargement..." : "Télécharger la facture (PDF)"}
    </Button>
  );
}
