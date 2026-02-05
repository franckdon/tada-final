//src/stores/useCreditsPurchaseFlowStore.ts
"use client";

import { create } from "zustand";

type PurchaseFlowState = {
  creditsModalOpen: boolean;
  paymentModalOpen: boolean;
  preparedPurchase: any | null;

  requiredCredits: number;
  requestedSample: number;

  openCreditsModal: (payload?: {
    preparedPurchase?: any;
    requiredCredits?: number;
    requestedSample?: number;
  }) => void;

  openPaymentModal: (prepared?: any) => void;
  closeCreditsModal: () => void;
  closePaymentModal: () => void;
  reset: () => void;
};

export const useCreditsPurchaseFlowStore = create<PurchaseFlowState>((set) => ({
  creditsModalOpen: false,
  paymentModalOpen: false,
  preparedPurchase: null,

  requiredCredits: 0,
  requestedSample: 0,

  openCreditsModal: (payload) =>
    set({
      creditsModalOpen: true,
      paymentModalOpen: false,
      preparedPurchase: payload?.preparedPurchase ?? null,
      requiredCredits: payload?.requiredCredits ?? 0,
      requestedSample: payload?.requestedSample ?? 0,
    }),

  openPaymentModal: (prepared) =>
    set({
      paymentModalOpen: true,
      creditsModalOpen: false,
      preparedPurchase: prepared ?? null,
    }),

  closeCreditsModal: () => set({ creditsModalOpen: false }),
  closePaymentModal: () => set({ paymentModalOpen: false }),
  reset: () =>
    set({
      creditsModalOpen: false,
      paymentModalOpen: false,
      preparedPurchase: null,
      requiredCredits: 0,
      requestedSample: 0,
    }),
}));
