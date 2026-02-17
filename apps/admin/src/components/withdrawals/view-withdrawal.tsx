"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@tada/ui/components/badge";
import { Button } from "@tada/ui/components/button";
import { Card } from "@tada/ui/components/card";
import { Separator } from "@tada/ui/components/separator";
import { cn } from "@tada/ui/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Banknote,
  User2,
  CreditCard,
  CalendarClock,
  Info,
  Loader2,
  Ban,
} from "lucide-react";

type WithdrawalDetails = {
  id: string;
  status: string;
  amount: string;
  currency: string;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;

  idempotencyKey: string | null;

  payoutSnapshot: any | null;

  reviewedById: string | null;
  reviewedAt: Date | string | null;
  rejectionReason: string | null;

  paidAt: Date | string | null;
  providerRef: string | null;

  user: { id: string; name: string; email: string } | null;

  payoutAccount: {
    id: string;
    type: string;
    label: string;
    provider: string | null;
    country: string | null;
    dialCode: string | null;
    phone: string | null;
    bankName: string | null;
    iban: string | null;
    rib: string | null;
    bic: string | null;
    isDefault: boolean;
  } | null;

  walletAccount: {
    id: string;
    providerId: string;
    currency: string;
    balance: string;
  } | null;
};

function formatDateFR(d?: Date | string | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoneyFR(amountRaw: string, currency: string) {
  const n = Number(amountRaw);
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("fr-FR").format(safe) + ` ${currency}`;
}

function statusBadge(status: string) {
  const s = String(status);
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-900",
    approved: "bg-blue-100 text-blue-900",
    rejected: "bg-red-100 text-red-800",
    paid: "bg-green-100 text-green-800",
    canceled: "bg-gray-100 text-gray-800",
  };
  return map[s] ?? "bg-slate-100 text-slate-800";
}

function statusIcon(status: string) {
  const s = String(status);
  if (s === "pending") return <Clock className="h-4 w-4 text-yellow-700" />;
  if (s === "approved")
    return <CheckCircle2 className="h-4 w-4 text-blue-700" />;
  if (s === "rejected") return <XCircle className="h-4 w-4 text-red-700" />;
  if (s === "paid") return <CheckCircle2 className="h-4 w-4 text-green-700" />;
  if (s === "canceled") return <Ban className="h-4 w-4 text-gray-600" />;
  return <Info className="h-4 w-4 text-gray-600" />;
}

function endpoints(id: string) {
  return {
    approve: `/api/withdrawals/${id}/approve`,
    pay: `/api/withdrawals/${id}/pay`,
    reject: `/api/withdrawals/${id}/reject`,
    cancel: `/api/withdrawals/${id}/cancel`,
  };
}

// ✅ règles d’actions cohérentes avec flow 2 étapes
function canApprove(status: string) {
  return String(status) === "pending";
}
function canPay(status: string) {
  return String(status) === "approved";
}
function canReject(status: string) {
  return String(status) === "pending";
}
function canCancelAdmin(status: string) {
  // autorisé tant que ce n’est pas payé (car pas de débit avant pay)
  const s = String(status);
  return s === "pending" || s === "approved";
}

export function ViewWithdrawal({
  locale,
  withdrawal,
}: {
  locale: string;
  withdrawal: WithdrawalDetails;
}) {
  const router = useRouter();
  const w = withdrawal;

  const [loading, setLoading] = useState<
    null | "approve" | "pay" | "reject" | "cancel"
  >(null);
  const [error, setError] = useState<string | null>(null);

  const actionEnabled = useMemo(() => {
    return {
      approve: canApprove(w.status),
      pay: canPay(w.status),
      reject: canReject(w.status),
      cancel: canCancelAdmin(w.status),
    };
  }, [w.status]);

  async function postJson(url: string, body?: any) {
    const res = await fetch(url, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    let json: any = null;
    try {
      json = await res.json();
    } catch {}

    if (!res.ok) {
      const err =
        json?.error ||
        json?.message ||
        `Erreur (${res.status}) lors de l'appel ${url}`;
      throw new Error(err);
    }

    return json;
  }

  // ✅ approve = review only (no debit)
  async function doApprove() {
    if (
      !window.confirm(
        "Valider cette demande ? (status -> approved, sans débit)",
      )
    )
      return;

    setError(null);
    setLoading("approve");
    try {
      await postJson(endpoints(w.id).approve, {
        // reviewedById: "..." // optionnel
      });
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
    } finally {
      setLoading(null);
    }
  }

  // ✅ pay = debit + status paid
  async function doPay() {
    const providerRef = window.prompt("providerRef (optionnel) ?");
    if (!window.confirm("Marquer payé ? (Débit du wallet + status -> paid)"))
      return;

    setError(null);
    setLoading("pay");
    try {
      await postJson(
        endpoints(w.id).pay,
        providerRef && providerRef.trim().length > 0
          ? { providerRef: providerRef.trim() }
          : undefined,
      );
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
    } finally {
      setLoading(null);
    }
  }

  async function doReject() {
    const reason = window.prompt("Motif du rejet ?");
    if (!reason || reason.trim().length === 0) return;
    if (!window.confirm("Confirmer le rejet ?")) return;

    setError(null);
    setLoading("reject");
    try {
      await postJson(endpoints(w.id).reject, {
        reason: reason.trim(),
        // reviewedById: "..." // optionnel
      });
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
    } finally {
      setLoading(null);
    }
  }

  async function doCancel() {
    if (!window.confirm("Annuler cette demande ? (pending/approved)")) return;

    setError(null);
    setLoading("cancel");
    try {
      await postJson(endpoints(w.id).cancel);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Link
            href={`/${locale}/withdrawals`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Link>

          <h1 className="text-2xl font-semibold text-gray-900">
            Demande de retrait
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              ID: {w.id}
            </Badge>

            <Badge
              className={cn(
                "text-xs inline-flex items-center gap-2",
                statusBadge(w.status),
              )}
            >
              {statusIcon(w.status)}
              {String(w.status)}
            </Badge>

            <Badge
              variant="secondary"
              className="text-xs inline-flex items-center gap-2"
            >
              <Banknote className="h-3.5 w-3.5" />
              {formatMoneyFR(w.amount, w.currency)}
            </Badge>
          </div>

          {error ? (
            <div className="text-sm text-red-600 mt-2">{error}</div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={doReject}
            disabled={!actionEnabled.reject || loading !== null}
          >
            {loading === "reject" ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Rejet...
              </span>
            ) : (
              "Rejeter"
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={doCancel}
            disabled={!actionEnabled.cancel || loading !== null}
          >
            {loading === "cancel" ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Annulation...
              </span>
            ) : (
              "Annuler"
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={doApprove}
            disabled={!actionEnabled.approve || loading !== null}
          >
            {loading === "approve" ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Validation...
              </span>
            ) : (
              "Valider (Approve)"
            )}
          </Button>

          <Button
            onClick={doPay}
            disabled={!actionEnabled.pay || loading !== null}
          >
            {loading === "pay" ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Paiement...
              </span>
            ) : (
              "Marquer payé"
            )}
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <User2 className="h-4 w-4 text-gray-600" />
            Utilisateur
          </div>
          <Separator className="my-3" />
          {w.user ? (
            <div className="space-y-1">
              <div className="text-sm text-gray-900 font-medium">
                {w.user.name || "—"}
              </div>
              <div className="text-sm text-gray-600">{w.user.email || "—"}</div>
              <div className="text-xs text-gray-500">userId: {w.user.id}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">—</div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <CreditCard className="h-4 w-4 text-gray-600" />
            Wallet account
          </div>
          <Separator className="my-3" />
          {w.walletAccount ? (
            <div className="space-y-1">
              <div className="text-sm text-gray-900 font-medium">
                Provider: {w.walletAccount.providerId || "—"}
              </div>
              <div className="text-sm text-gray-600">
                Balance:{" "}
                {formatMoneyFR(
                  w.walletAccount.balance,
                  w.walletAccount.currency,
                )}
              </div>
              <div className="text-xs text-gray-500">
                accountPkId: {w.walletAccount.id}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">—</div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <CalendarClock className="h-4 w-4 text-gray-600" />
            Dates
          </div>
          <Separator className="my-3" />
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-600">Créée</span>
              <span className="text-gray-900 tabular-nums">
                {formatDateFR(w.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-600">Mise à jour</span>
              <span className="text-gray-900 tabular-nums">
                {formatDateFR(w.updatedAt)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Details */}
      <Card className="p-5">
        <div className="text-base font-semibold text-gray-900">
          Détails du payout
        </div>
        <Separator className="my-4" />

        {w.payoutAccount ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Payout account</div>
              <div className="text-sm">
                <span className="font-medium text-gray-900">
                  {w.payoutAccount.label || "—"}
                </span>
                <span className="text-gray-500">
                  {" "}
                  • {w.payoutAccount.type || "—"}
                </span>
              </div>

              <div className="text-sm text-gray-700">
                Provider:{" "}
                <span className="text-gray-900">
                  {w.payoutAccount.provider ?? "—"}
                </span>
              </div>

              <div className="text-sm text-gray-700">
                Pays:{" "}
                <span className="text-gray-900">
                  {w.payoutAccount.country ?? "—"}
                </span>
              </div>

              <div className="text-sm text-gray-700">
                Téléphone:{" "}
                <span className="text-gray-900">
                  {(w.payoutAccount.dialCode ?? "") +
                    " " +
                    (w.payoutAccount.phone ?? "—")}
                </span>
              </div>

              <div className="text-xs text-gray-500">
                payoutAccountId: {w.payoutAccount.id}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-600">Banque / IBAN / RIB</div>
              <div className="text-sm text-gray-700">
                Banque:{" "}
                <span className="text-gray-900">
                  {w.payoutAccount.bankName ?? "—"}
                </span>
              </div>
              <div className="text-sm text-gray-700">
                IBAN:{" "}
                <span className="text-gray-900">
                  {w.payoutAccount.iban ?? "—"}
                </span>
              </div>
              <div className="text-sm text-gray-700">
                RIB:{" "}
                <span className="text-gray-900">
                  {w.payoutAccount.rib ?? "—"}
                </span>
              </div>
              <div className="text-sm text-gray-700">
                BIC:{" "}
                <span className="text-gray-900">
                  {w.payoutAccount.bic ?? "—"}
                </span>
              </div>

              {w.payoutAccount.isDefault ? (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  Compte par défaut
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Non par défaut
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">Aucun payout account lié.</div>
        )}

        <Separator className="my-5" />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900">
              Admin review
            </div>
            <div className="text-sm text-gray-700">
              reviewedAt:{" "}
              <span className="text-gray-900">
                {formatDateFR(w.reviewedAt)}
              </span>
            </div>
            <div className="text-sm text-gray-700">
              reviewedById:{" "}
              <span className="text-gray-900">{w.reviewedById ?? "—"}</span>
            </div>
            <div className="text-sm text-gray-700">
              reason:{" "}
              <span className="text-gray-900">{w.rejectionReason ?? "—"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900">Execution</div>
            <div className="text-sm text-gray-700">
              paidAt:{" "}
              <span className="text-gray-900">{formatDateFR(w.paidAt)}</span>
            </div>
            <div className="text-sm text-gray-700">
              providerRef:{" "}
              <span className="text-gray-900">{w.providerRef ?? "—"}</span>
            </div>
            <div className="text-sm text-gray-700">
              idempotencyKey:{" "}
              <span className="text-gray-900">{w.idempotencyKey ?? "—"}</span>
            </div>
          </div>
        </div>

        {w.payoutSnapshot ? (
          <>
            <Separator className="my-5" />
            <div className="text-sm font-medium text-gray-900 mb-2">
              Snapshot (JSON)
            </div>
            <pre className="text-xs bg-gray-50 border rounded-lg p-3 overflow-auto">
              {JSON.stringify(w.payoutSnapshot, null, 2)}
            </pre>
          </>
        ) : null}
      </Card>
    </div>
  );
}
