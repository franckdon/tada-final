// src/hooks/use-workspace-credits.ts
"use client";

import { useEffect, useRef } from "react";
import { useWorkspaceCreditsStore } from "@/hooks/use-workspace-credit-store";

export function useWorkspaceCredits(workspaceId?: string | null) {
  const beginRequest = useWorkspaceCreditsStore((s) => s.beginRequest);
  const commitFetchResult = useWorkspaceCreditsStore((s) => s.commitFetchResult);
  const clearDisplay = useWorkspaceCreditsStore((s) => s.clearDisplay);
  const hydrateFromCache = useWorkspaceCreditsStore((s) => s.hydrateFromCache);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!workspaceId) {
      abortRef.current?.abort();
      clearDisplay();
      return;
    }

    // 1) afficher cache instantanément si présent
    hydrateFromCache(workspaceId);

    // 2) éviter flash de l'ancien workspace : on clear si pas de cache
    // (si tu veux être strict : clearDisplay() systématique avant fetch)
    // Ici : uniquement si pas de cache
    // -> si tu préfères UX “squelette”, remplace par clearDisplay() tout le temps
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snap = (useWorkspaceCreditsStore.getState() as any).byWorkspace?.[workspaceId];
    if (!snap) clearDisplay();

    // 3) annuler ancienne requête
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // 4) anti-race condition : requestKey
    const requestKey = beginRequest(workspaceId);

    (async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/credits`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const json = await res.json().catch(() => null);

        if (!res.ok || !json?.success) {
          // On stoppe le loader si la requête est encore active
          commitFetchResult({
            workspaceId,
            requestKey,
            balance: 0,
            currency: "EUR",
            subscription: null,
          });
          return;
        }

        const data = json.data;

        commitFetchResult({
          workspaceId,
          requestKey,
          balance: typeof data.balance === "number" ? data.balance : 0,
          currency: data.currency ?? "EUR",
          subscription: data.subscription ?? null,
        });
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        // erreur réseau => on évite de ré-afficher l'ancien solde
        commitFetchResult({
          workspaceId,
          requestKey,
          balance: 0,
          currency: "EUR",
          subscription: null,
        });
      }
    })();

    return () => {
      controller.abort();
    };
  }, [workspaceId, beginRequest, commitFetchResult, clearDisplay, hydrateFromCache]);
}
