"use client";
import { create } from "zustand";

type WorkspaceCreditsState = {
  workspaceId: string | null;
  balance: number;
  currency: string;

  loading: boolean;
  setWorkspaceId: (id: string | null) => void;

  setCredits: (balance: number, currency?: string) => void;
  reset: () => void;
};

export const useWorkspaceCreditsStore = create<WorkspaceCreditsState>((set) => ({
  workspaceId: null,
  balance: 0,
  currency: "EUR",
  loading: false,

  setWorkspaceId: (workspaceId) => set({ workspaceId }),

  setCredits: (balance, currency) =>
    set((s) => ({ balance, currency: currency ?? s.currency })),

  reset: () =>
    set({
      workspaceId: null,
      balance: 0,
      currency: "EUR",
      loading: false,
    }),
}));
