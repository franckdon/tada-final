"use client";

import { create } from "zustand";

interface BillingData {
  credits: number;
  unitPrice: number;
  street: string;
  city: string;
  zip: string;
  country: string;
  company: string;
  civility: "other" | "m" | "f" | undefined;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  organizationId: string;
  setField: <K extends keyof BillingData>(
    field: K,
    value: BillingData[K]
  ) => void;
  setAllFields: (data: Partial<BillingData>) => void;
  reset: () => void;
}

export const useBillingStore = create<BillingData>((set) => ({
  credits: 500,
  unitPrice: 12,
  street: "",
  city: "",
  zip: "",
  country: "",
  company: "",
  civility: "m",
  firstName: "",
  lastName: "",
  organizationId: "",
  acceptTerms: false,
  setField: (field, value) => set(() => ({ [field]: value })),
  setAllFields: (data) => set((state) => ({ ...state, ...data })),
  reset: () =>
    set({
      credits: 500,
      unitPrice: 12,
      street: "",
      city: "",
      zip: "",
      country: "",
      company: "",
      civility: "m",
      firstName: "",
      lastName: "",
      organizationId: "",
      acceptTerms: false,
    }),
}));
