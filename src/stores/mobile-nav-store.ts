import { create } from "zustand";

type MobileNavStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useMobileNavStore = create<MobileNavStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
