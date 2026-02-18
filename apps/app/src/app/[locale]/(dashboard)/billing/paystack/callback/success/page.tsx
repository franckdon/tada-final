"use client";

// apps/app/src/app/[locale]/(dashboard)/billing/paystack/callback/success/page.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@tada/ui/components/button";
import { Icons } from "@/components/icons";
import { ExternalLink, CheckCircle2, ArrowRight, LifeBuoy } from "lucide-react";

import { useI18n } from "@/locales/client";
import { authClient } from "@/lib/auth-client";

type VerifyPaystackResponse = {
  ok: boolean;
  error?: string;

  reference?: string;
  purchaseId?: string;
  status?: string;

  // ✅ returned by our verify route
  invoiceId?: string;
  invoiceNumber?: string;
  invoiceStatus?: string;

  // purchase snapshot (so we can build PDF url)
  purchase?: {
    workspaceId?: string;
  };

  // optional
  alreadyPaid?: boolean;
};

export default function PaystackBillingSuccessPage() {
  const t = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: organizations } = authClient.useListOrganizations();

  const reference = searchParams.get("reference")?.trim() || "";
  const statusHint = searchParams.get("status")?.trim() || "";
  const purchaseIdHint = searchParams.get("purchaseId")?.trim() || "";

  // ✅ from callback redirect (best effort)
  const invoiceIdHint = searchParams.get("invoiceId")?.trim() || "";
  const invoiceNumberHint = searchParams.get("invoiceNumber")?.trim() || "";
  const workspaceIdHint = searchParams.get("workspaceId")?.trim() || "";

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [data, setData] = useState<VerifyPaystackResponse | null>(null);
  const [error, setError] = useState("");

  const orgId = organizations?.[0]?.id ?? null;

  const dashboardHref = useMemo(() => "/", [orgId]);
  const pricingHref = useMemo(() => "/pricing", []);

  const resolvedInvoiceId = data?.invoiceId || invoiceIdHint || "";
  const resolvedInvoiceNumber = data?.invoiceNumber || invoiceNumberHint || "";
  const resolvedWorkspaceId =
    data?.purchase?.workspaceId || workspaceIdHint || "";

  const pdfUrl = useMemo(() => {
    if (!resolvedWorkspaceId || !resolvedInvoiceId) return "";
    return `/api/workspaces/${encodeURIComponent(
      resolvedWorkspaceId,
    )}/invoices/${encodeURIComponent(resolvedInvoiceId)}/pdf`;
  }, [resolvedWorkspaceId, resolvedInvoiceId]);

  useEffect(() => {
    const verify = async () => {
      // Paystack status in URL is just a hint, not proof.
      if (!reference) {
        setError("Reference manquante.");
        setLoading(false);
        return;
      }

      // Optional fast UI if paystack hints failure
      if (statusHint && statusHint !== "success") {
        setError(`Paiement non confirmé (status=${statusHint}).`);
        setLoading(false);
        return;
      }

      try {
        // ✅ Always verify server-side (idempotent)
        const res = await fetch(`/api/payments/paystack/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
          cache: "no-store",
        });

        const json = (await res
          .json()
          .catch(() => ({}))) as VerifyPaystackResponse;

        if (!res.ok || !json?.ok) {
          setError(json?.error || t("billing.errors.generalError"));
          setLoading(false);
          return;
        }

        setData(json);
        setMessage("Paiement confirmé ✅ Vos crédits ont été appliqués.");
      } catch (e) {
        console.error("[PaystackBillingSuccessPage] verify error:", e);
        setError("Erreur lors de la vérification Paystack.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [reference, statusHint, t]);

  const handleContinue = () => router.push(dashboardHref);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-10">
        <div className="rounded-xl border bg-white p-6 shadow-sm text-center">
          <Icons.spinner className="animate-spin w-8 h-8 mx-auto mb-3" />
          <p className="text-sm text-gray-600">
            {t("billing.loading.verifyingPayment")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-10">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-red-600">
              {t("billing.error.title")}
            </h1>
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => router.push(pricingHref)}>
              {t("billing.actions.backToPricing")}
            </Button>

            <Link
              href="/support"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-gray-50"
            >
              <LifeBuoy className="h-4 w-4" />
              Support
            </Link>
          </div>

          {(reference || purchaseIdHint) && (
            <p className="mt-4 text-xs text-gray-500 text-center">
              ref: <span className="font-mono">{reference}</span>
              {purchaseIdHint ? (
                <>
                  {" "}
                  • purchaseId:{" "}
                  <span className="font-mono">{purchaseIdHint}</span>
                </>
              ) : null}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">
              {t("billing.success.title")}
            </h1>
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          </div>
        </div>

        {/* ✅ Invoice block (internal PDF) */}
        {resolvedInvoiceId || resolvedInvoiceNumber || pdfUrl ? (
          <div className="mt-6 rounded-lg border bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-gray-900">
                {t("billing.invoice.title")}
              </h2>

              {resolvedInvoiceNumber ? (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-800 border">
                  #{resolvedInvoiceNumber}
                </span>
              ) : resolvedInvoiceId ? (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-800 border">
                  #{resolvedInvoiceId.slice(0, 8)}
                </span>
              ) : null}
            </div>

            <div className="mt-3 flex flex-col gap-2 text-sm">
              {pdfUrl ? (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                >
                  {t("billing.invoice.downloadPdf")} <ExternalLink size={16} />
                </a>
              ) : (
                <div className="text-xs text-gray-600">
                  PDF indisponible (workspaceId/invoiceId manquant).
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            href={pricingHref}
            className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-gray-50"
          >
            {t("billing.actions.backToPricing")}
          </Link>

          <Button onClick={handleContinue} className="inline-flex gap-2">
            {t("billing.actions.continueToDashboard")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Debug line */}
        {reference ? (
          <p className="mt-4 text-xs text-gray-500">
            ref: <span className="font-mono">{reference}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
