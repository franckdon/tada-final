"use client";

import * as React from "react";
import { Button } from "@tada/ui/components/button";
import { useToast } from "@/hooks/use-toast";

export default function CreditsInvoiceDownloadButton({
  workspaceId,
  invoiceId,
  enabled,
}: {
  workspaceId: string;
  invoiceId: string | null;
  enabled: boolean;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const download = async () => {
    if (!invoiceId) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/credits/invoices/${invoiceId}`,
        { method: "GET" },
      );

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || "Impossible de télécharger la facture");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const cd = res.headers.get("content-disposition") || "";
      const match = cd.match(/filename="(.+?)"/);
      const filename = match?.[1] || "credits-invoice.pdf";

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

  if (!enabled || !invoiceId) return null;

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
