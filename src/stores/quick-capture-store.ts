import { create } from "zustand";

type QuickCaptureStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useQuickCaptureStore = create<QuickCaptureStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
