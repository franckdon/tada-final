// src/app/[locale]/(dashboard)/billing/success/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@tada/ui/components/button";
import { Icons } from "@/components/icons";
import { ExternalLink, CheckCircle2, ArrowRight, LifeBuoy } from "lucide-react";

import { useI18n } from "@/locales/client";
import { authClient } from "@/lib/auth-client";

type VerifySessionResponse = {
  invoice?: {
    number?: string;
    hosted_invoice_url?: string;
    invoice_pdf?: string;
  };
  // tu peux ajouter d'autres champs si ton API en retourne
};

export default function BillingSuccessPage() {
  const t = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: organizations } = authClient.useListOrganizations();

  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sessionData, setSessionData] = useState<VerifySessionResponse | null>(
    null,
  );
  const [error, setError] = useState("");

  const orgId = organizations?.[0]?.id ?? null;

  const dashboardHref = useMemo(() => {
    // adapte si ton “home dashboard” n’est pas /market-beats/[orgId]
    if (orgId) return `/market-beats/${orgId}`;
    return "/";
  }, [orgId]);

  const pricingHref = useMemo(() => {
    // si tu as /pricing/[orgId] mets-le ici, sinon /pricing
    return orgId ? `/pricing/${orgId}` : "/pricing";
  }, [orgId]);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setError(t("billing.errors.missingSessionId"));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/verify-checkout-session?session_id=${encodeURIComponent(
            sessionId,
          )}`,
          { cache: "no-store" },
        );

        const data = (await res.json().catch(() => ({}))) as any;

        if (!res.ok) {
          setError(data?.error || t("billing.errors.generalError"));
          setLoading(false);
          return;
        }

        setMessage(t("billing.success.subscriptionActivated"));
        setSessionData(data as VerifySessionResponse);
      } catch (e) {
        console.error("[BillingSuccessPage] verify error:", e);
        setError(t("billing.errors.sessionRetrievalError"));
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, t]);

  const handleContinue = () => {
    router.push(dashboardHref);
  };

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

          {sessionId ? (
            <p className="mt-4 text-xs text-gray-500 text-center">
              session_id: <span className="font-mono">{sessionId}</span>
            </p>
          ) : null}
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

        {sessionData?.invoice ? (
          <div className="mt-6 rounded-lg border bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-gray-900">
                {t("billing.invoice.title")}
              </h2>
              {sessionData.invoice.number ? (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-800 border">
                  #{sessionData.invoice.number}
                </span>
              ) : null}
            </div>

            <div className="mt-3 flex flex-col gap-2 text-sm">
              {sessionData.invoice.hosted_invoice_url ? (
                <a
                  href={sessionData.invoice.hosted_invoice_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                >
                  {t("billing.invoice.viewOnline")} <ExternalLink size={16} />
                </a>
              ) : null}

              {sessionData.invoice.invoice_pdf ? (
                <a
                  href={sessionData.invoice.invoice_pdf}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                >
                  {t("billing.invoice.downloadPdf")} <ExternalLink size={16} />
                </a>
              ) : null}

              {!sessionData.invoice.hosted_invoice_url &&
              !sessionData.invoice.invoice_pdf ? (
                <p className="text-xs text-gray-500">
                  Aucune facture disponible pour l’instant.
                </p>
              ) : null}
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
      </div>
    </div>
  );
}
