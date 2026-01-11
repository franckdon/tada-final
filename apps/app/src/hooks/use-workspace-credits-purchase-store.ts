"use client";
import { create } from "zustand";

type WorkspaceCreditsPurchaseState = {
  workspaceId: string | null;
  credits: number;
  unitPrice: number;
  currency: string;

  setWorkspaceId: (id: string | null) => void;
  setCredits: (credits: number) => void;
  setUnitPrice: (unitPrice: number) => void;
  setCurrency: (currency: string) => void;

  reset: () => void;
};

export const useWorkspaceCreditsPurchaseStore =
  create<WorkspaceCreditsPurchaseState>((set) => ({
    workspaceId: null,
    credits: 0,
    unitPrice: 12,
    currency: "EUR",

    setWorkspaceId: (workspaceId) => set({ workspaceId }),
    setCredits: (credits) => set({ credits }),
    setUnitPrice: (unitPrice) => set({ unitPrice }),
    setCurrency: (currency) => set({ currency }),

    reset: () =>
      set({
        workspaceId: null,
        credits: 0,
        unitPrice: 12,
        currency: "EUR",
      }),
  }));
