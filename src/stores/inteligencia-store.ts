import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AnalisisSemanal } from "@/types/inteligencia";
import { crearStorageScopedPorCuenta } from "@/lib/storage-por-cuenta";

type InteligenciaStore = {
  analisisSemanal: AnalisisSemanal[];
  agregarAnalisisSemanal: (analisis: AnalisisSemanal) => void;
};

export const useInteligenciaStore = create<InteligenciaStore>()(
  persist(
    (set) => ({
      analisisSemanal: [],
      agregarAnalisisSemanal: (analisis) =>
        set((state) => ({ analisisSemanal: [analisis, ...state.analisisSemanal] })),
    }),
    {
      name: "axiom-mind-inteligencia",
      storage: createJSONStorage(() => crearStorageScopedPorCuenta()),
    }
  )
);
