// src/hooks/use-workspace-credit-store.ts
"use client";

import { create } from "zustand";

export type WorkspaceSubscriptionUI = {
  planCode: string | null;
  planLabel: string | null;
  status: "active" | "inactive" | "expired" | "scheduled" | string;
  startsAt: string | null;
  endsAt: string | null;
};

export type WorkspaceCreditsSnapshot = {
  balance: number;
  currency: string;
  subscription: WorkspaceSubscriptionUI | null;
  fetchedAt: number;
};

type WorkspaceCreditsState = {
  // workspace actuellement affiché
  workspaceId: string | null;

  // ce qui est affiché (dérivé du cache)
  balance: number;
  currency: string;
  subscription: WorkspaceSubscriptionUI | null;

  // cache par workspace
  byWorkspace: Record<string, WorkspaceCreditsSnapshot>;

  // UX
  loading: boolean;

  // contrôle anti-race condition
  activeRequestKey: string | null;

  setWorkspaceId: (id: string | null) => void;
  setLoading: (v: boolean) => void;

  // met à jour une réponse pour un workspace, mais seulement si c'est la requête active
  commitFetchResult: (args: {
    workspaceId: string;
    requestKey: string;
    balance: number;
    currency: string;
    subscription: WorkspaceSubscriptionUI | null;
  }) => void;

  // démarre une requête (génère une clé)
  beginRequest: (workspaceId: string) => string;

  // purge l'affichage (évite le flash de l'ancien solde)
  clearDisplay: () => void;

  // force l'affichage depuis le cache si disponible
  hydrateFromCache: (workspaceId: string) => void;

  reset: () => void;
};

export const useWorkspaceCreditsStore = create<WorkspaceCreditsState>((set, get) => ({
  workspaceId: null,

  balance: 0,
  currency: "EUR",
  subscription: null,

  byWorkspace: {},

  loading: false,
  activeRequestKey: null,

  setWorkspaceId: (id) => {
    set({ workspaceId: id });
    if (!id) {
      set({ balance: 0, currency: "EUR", subscription: null });
      return;
    }
    // si on a déjà du cache, on affiche immédiatement (sans flash)
    get().hydrateFromCache(id);
  },

  setLoading: (v) => set({ loading: v }),

  beginRequest: (workspaceId) => {
    const requestKey = `${workspaceId}:${Date.now()}:${Math.random().toString(16).slice(2)}`;
    set({ activeRequestKey: requestKey, loading: true });
    return requestKey;
  },

  commitFetchResult: ({ workspaceId, requestKey, balance, currency, subscription }) => {
    const state = get();

    // ignore si une autre requête a été lancée entre temps
    if (state.activeRequestKey !== requestKey) return;

    const snap: WorkspaceCreditsSnapshot = {
      balance,
      currency,
      subscription,
      fetchedAt: Date.now(),
    };

    set((s) => ({
      byWorkspace: { ...s.byWorkspace, [workspaceId]: snap },
      balance,
      currency,
      subscription,
      loading: false,
      activeRequestKey: null,
    }));
  },

  clearDisplay: () =>
    set({
      balance: 0,
      currency: "EUR",
      subscription: null,
    }),

  hydrateFromCache: (workspaceId) => {
    const snap = get().byWorkspace[workspaceId];
    if (!snap) return;
    set({
      balance: snap.balance,
      currency: snap.currency,
      subscription: snap.subscription,
    });
  },

  reset: () =>
    set({
      workspaceId: null,
      balance: 0,
      currency: "EUR",
      subscription: null,
      byWorkspace: {},
      loading: false,
      activeRequestKey: null,
    }),
}));
