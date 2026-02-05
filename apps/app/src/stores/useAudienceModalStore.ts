// src/stores/useAudienceModalStore.ts
import { create } from "zustand";

type AudienceModalState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openModal: () => void;
  closeModal: () => void;
};

export const useAudienceModalStore = create<AudienceModalState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false }),
}));
