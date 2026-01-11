"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@tada/ui/components/button";
import { Icons } from "@/components/icons";
import { ExternalLink } from "lucide-react";
import { useI18n } from "@/locales/client";
import { authClient } from "@/lib/auth-client";

export default function BillingSuccessPage() {
  const t = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: organizations } = authClient.useListOrganizations();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setError(t("billing.errors.missingSessionId"));
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/verify-checkout-session?session_id=${sessionId}`
        );
        const data = await res.json();
        if (res.ok) {
          setMessage(t("billing.success.subscriptionActivated"));
          setSessionData(data);
        } else {
          setError(data.error || t("billing.errors.generalError"));
        }
      } catch (error) {
        console.log("error", error);
        setError(t("billing.errors.sessionRetrievalError"));
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId, t]);

  const handleContinue = () => {
    router.push(`/market-beats/${organizations![0]?.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Icons.spinner className="animate-spin w-8 h-8 mx-auto mb-4" />
          <p className="text-lg text-gray-600">
            {t("billing.loading.verifyingPayment")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            {t("billing.error.title")}
          </h1>
          <p className="text-red-600 mb-6">{error}</p>
          <Button
            onClick={() => router.push(`/pricing/${organizations![0]?.id}`)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {t("billing.actions.backToPricing")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-gray-50 h-full">
      <div className="p-8 md:p-12 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-green-500">
            {t("billing.success.title")}
          </h1>
          <p className="text-gray-600">{message}</p>
        </div>

        {sessionData && (
          <div className="space-y-6">
            {sessionData.invoice && (
              <div className="bg-gray-100 rounded-lg p-4 border">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {t("billing.invoice.title")}
                </h2>
                <p>
                  {t("billing.invoice.number")} :{" "}
                  <span className="font-mono">
                    {sessionData.invoice.number}
                  </span>
                </p>
                <div className="flex gap-4 mt-3">
                  <a
                    href={sessionData.invoice.hosted_invoice_url}
                    target="_blank"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    {t("billing.invoice.viewOnline")} <ExternalLink size={16} />
                  </a>
                  <a
                    href={sessionData.invoice.invoice_pdf}
                    target="_blank"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    {t("billing.invoice.downloadPdf")}{" "}
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button onClick={handleContinue} className="bg-primary px-8 py-4">
            {t("billing.actions.continueToDashboard")}
          </Button>
        </div>
      </div>
    </div>
  );
}
