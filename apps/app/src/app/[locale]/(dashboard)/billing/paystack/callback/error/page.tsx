// src/app/billing/paystack/callback/error/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaystackCallbackErrorPage() {
  const sp = useSearchParams();
  const reference = sp.get("reference") ?? "";
  const reason = sp.get("reason") ?? "unknown_error";

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full border rounded-lg p-6 bg-white">
        <h1 className="text-xl font-semibold">Paiement échoué</h1>

        <div className="mt-4 text-sm text-gray-700 space-y-2">
          <div>
            <span className="text-gray-500">Référence:</span>{" "}
            <span className="font-mono">{reference || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">Raison:</span>{" "}
            <span className="font-mono">{reason}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/pricing"
            className="px-4 py-2 rounded-md border hover:bg-gray-50"
          >
            Retour billing
          </Link>

          <Link
            href="/"
            className="px-4 py-2 rounded-md bg-black text-white hover:opacity-90"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
