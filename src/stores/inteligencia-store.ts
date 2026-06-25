import { create } from "zustand";

import type { AnalisisSemanal } from "@/types/inteligencia";

type InteligenciaStore = {
  analisisSemanal: AnalisisSemanal[];
  agregarAnalisisSemanal: (analisis: AnalisisSemanal) => void;
};

export const useInteligenciaStore = create<InteligenciaStore>((set) => ({
  analisisSemanal: [],
  agregarAnalisisSemanal: (analisis) =>
    set((state) => ({ analisisSemanal: [analisis, ...state.analisisSemanal] })),
}));
