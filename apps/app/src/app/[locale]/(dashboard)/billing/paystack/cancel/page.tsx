"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft, RefreshCcw, LifeBuoy } from "lucide-react";

export default function BillingCancelPage() {
  const { locale } = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">
              Paiement annulé
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Le processus de paiement a été interrompu. Aucun débit n’a été
              confirmé.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          <p className="font-medium text-gray-900">Que faire maintenant ?</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Vous pouvez relancer le paiement quand vous voulez.</li>
            <li>
              Si vous pensez avoir été débité, contactez le support avec votre
              email et l’heure approximative du paiement.
            </li>
          </ul>
        </div>

        {reference && (
          <p className="mt-4 text-xs text-gray-500 text-center">
            Référence paiement : <span className="font-mono">{reference}</span>
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${locale}/billing`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-black px-4 text-sm font-medium text-white hover:bg-black/90"
          >
            <RefreshCcw className="h-4 w-4" />
            Réessayer
          </Link>

          <Link
            href={`/${locale}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </Link>

          <Link
            href={`/${locale}/support`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-gray-50"
          >
            <LifeBuoy className="h-4 w-4" />
            Support
          </Link>
        </div>
      </div>
    </div>
  );
}
