import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { crearStorageScopedPorCuenta } from "@/lib/storage-por-cuenta";

type CuentaMetaStore = {
  seedDemoAplicado: boolean;
  marcarSeedDemoAplicado: () => void;
};

export const useCuentaMetaStore = create<CuentaMetaStore>()(
  persist(
    (set) => ({
      seedDemoAplicado: false,
      marcarSeedDemoAplicado: () => set({ seedDemoAplicado: true }),
    }),
    {
      name: "axiom-mind-cuenta-meta",
      storage: createJSONStorage(() => crearStorageScopedPorCuenta()),
    }
  )
);
