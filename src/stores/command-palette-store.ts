import { create } from "zustand";

type CommandPaletteStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useCommandPaletteStore = create<CommandPaletteStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
