import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Deuda, Gasto, Ingreso, Inversion, ObjetivosFinancieros, Patrimonio } from "@/types/finanzas";
import {
  deudas as deudasIniciales,
  gastos as gastosIniciales,
  ingresos as ingresosIniciales,
  objetivosFinancieros as objetivosIniciales,
  patrimonio as patrimonioInicial,
} from "@/lib/mock/finanzas";
import { crearStorageScopedPorCuenta } from "@/lib/storage-por-cuenta";

type FinanzasStore = {
  ingresos: Ingreso[];
  gastos: Gasto[];
  deudas: Deuda[];
  objetivos: ObjetivosFinancieros;
  patrimonio: Patrimonio;
  agregarIngreso: (ingreso: Ingreso) => void;
  agregarGasto: (gasto: Gasto) => void;
  agregarDeuda: (deuda: Deuda) => void;
  registrarPagoDeuda: (id: string, monto: number, fecha: string) => void;
  eliminarDeuda: (id: string) => void;
  actualizarObjetivos: (cambios: Partial<ObjetivosFinancieros>) => void;
  agregarInversion: (inversion: Inversion) => void;
  eliminarInversion: (id: string) => void;
  actualizarPatrimonio: (cambios: Partial<Patrimonio>) => void;
};

export const useFinanzasStore = create<FinanzasStore>()(
  persist(
    (set) => ({
      ingresos: ingresosIniciales,
      gastos: gastosIniciales,
      deudas: deudasIniciales,
      objetivos: objetivosIniciales,
      patrimonio: patrimonioInicial,

      agregarIngreso: (ingreso) =>
        set((state) => ({ ingresos: [...state.ingresos, ingreso] })),

      agregarGasto: (gasto) =>
        set((state) => ({ gastos: [...state.gastos, gasto] })),

      agregarDeuda: (deuda) =>
        set((state) => ({ deudas: [...state.deudas, deuda] })),

      registrarPagoDeuda: (id, monto, fecha) =>
        set((state) => ({
          deudas: state.deudas.map((d) => {
            if (d.id !== id) return d;
            const pagos = [...d.pagos, { fecha, monto }];
            const pagado = pagos.reduce((acc, p) => acc + p.monto, 0);
            return { ...d, pagos, estado: pagado >= d.montoOriginal ? "Pagada" : "Activa" };
          }),
        })),

      eliminarDeuda: (id) =>
        set((state) => ({ deudas: state.deudas.filter((d) => d.id !== id) })),

      actualizarObjetivos: (cambios) =>
        set((state) => ({ objetivos: { ...state.objetivos, ...cambios } })),

      agregarInversion: (inversion) =>
        set((state) => ({
          objetivos: { ...state.objetivos, inversiones: [...state.objetivos.inversiones, inversion] },
        })),

      eliminarInversion: (id) =>
        set((state) => ({
          objetivos: {
            ...state.objetivos,
            inversiones: state.objetivos.inversiones.filter((i) => i.id !== id),
          },
        })),

      actualizarPatrimonio: (cambios) =>
        set((state) => ({ patrimonio: { ...state.patrimonio, ...cambios } })),
    }),
    {
      name: "axiom-mind-finanzas",
      storage: createJSONStorage(() => crearStorageScopedPorCuenta()),
    }
  )
);
