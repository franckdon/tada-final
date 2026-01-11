"use client";

import { useEffect, useState } from "react";
import { Button } from "@tada/ui/components/button";
import { Icons } from "@/components/icons";
import { ExternalLink, Download, Calendar, CreditCard } from "lucide-react";
import { auth } from "@/lib/auth";
import { useI18n } from "@/locales/client";
import { useSession } from "@/lib/auth-client";

interface Invoice {
  id: string;
  number: string;
  status: string;
  amount: number;
  currency: string;
  created: number;
  dueDate: number | null;
  paidAt: number | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  description: string | null;
  subscription: {
    id: string;
  } | null;
  paymentIntent: {
    id: string;
    status: string | null;
  } | null;
}

interface InvoicesResponse {
  invoices: Invoice[];
  hasMore: boolean;
  lastId: string | null;
}

export default function InvoicesList() {
  const t = useI18n();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchInvoices = async (startingAfter?: string) => {
    try {
      const url = new URL(
        `/api/invoices?email=${session?.user?.email}`,
        window.location.origin
      );
      if (startingAfter) {
        url.searchParams.set("starting_after", startingAfter);
      }
      url.searchParams.set("limit", "10");

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }

      const data: InvoicesResponse = await response.json();

      if (startingAfter) {
        setInvoices((prev) => [...prev, ...data.invoices]);
      } else {
        setInvoices(data.invoices);
      }

      setHasMore(data.hasMore);
      setLastId(data.lastId);
    } catch (err) {
      setError(t("invoices.errors.fetchError"));
    }
  };

  useEffect(() => {
    const loadInvoices = async () => {
      setLoading(true);
      await fetchInvoices();
      setLoading(false);
    };

    loadInvoices();
  }, [t]);

  const loadMore = async () => {
    if (!hasMore || !lastId) return;

    setLoadingMore(true);
    await fetchInvoices(lastId);
    setLoadingMore(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: {
        color: "bg-green-100 text-green-800",
        text: t("invoices.status.paid"),
      },
      open: {
        color: "bg-blue-100 text-blue-800",
        text: t("invoices.status.open"),
      },
      void: {
        color: "bg-gray-100 text-gray-800",
        text: t("invoices.status.void"),
      },
      uncollectible: {
        color: "bg-red-100 text-red-800",
        text: t("invoices.status.uncollectible"),
      },
      draft: {
        color: "bg-yellow-100 text-yellow-800",
        text: t("invoices.status.draft"),
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.open;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Icons.spinner className="animate-spin w-8 h-8 mx-auto mb-4" />
          <p className="text-lg text-gray-600">
            {t("invoices.loading.fetchingInvoices")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          {t("invoices.error.title")}
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700"
        >
          {t("invoices.actions.retry")}
        </Button>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {t("invoices.empty.title")}
        </h3>
        <p className="text-gray-600">{t("invoices.empty.description")}</p>
      </div>
    );
  }

  console.log("000000", invoices);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("invoices.title")}
        </h2>
        <p className="text-sm text-gray-500">
          {t("invoices.total", { count: invoices.length })}
        </p>
      </div>

      <div className="grid gap-4">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900">
                  {invoice.number || `INV-${invoice.id.slice(-8)}`}
                </h3>
                {getStatusBadge(invoice.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-semibold text-gray-900">
                    {formatAmount(invoice.amount, invoice.currency)}
                  </span>
                </div>

                {invoice.paidAt && (
                  <div className="text-green-600">
                    {t("invoices.paidOn")} {formatDate(invoice.paidAt)}
                  </div>
                )}
              </div>

              {invoice.description && (
                <p className="text-sm text-gray-500">{invoice.description}</p>
              )}

              <div className="flex gap-2 ml-4">
                {invoice.hostedInvoiceUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={invoice.hostedInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t("invoices.actions.view")}
                    </a>
                  </Button>
                )}

                {invoice.invoicePdf && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={invoice.invoicePdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {t("invoices.actions.download")}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center pt-6">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            variant="outline"
            className="px-8"
          >
            {loadingMore ? (
              <>
                <Icons.spinner className="animate-spin w-4 h-4 mr-2" />
                {t("invoices.actions.loading")}
              </>
            ) : (
              t("invoices.actions.loadMore")
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
