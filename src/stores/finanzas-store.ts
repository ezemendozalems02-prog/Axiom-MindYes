import { create } from "zustand";

import type { Gasto, Ingreso, ObjetivosFinancieros, Patrimonio } from "@/types/finanzas";
import {
  gastos as gastosIniciales,
  ingresos as ingresosIniciales,
  objetivosFinancieros as objetivosIniciales,
  patrimonio as patrimonioInicial,
} from "@/lib/mock/finanzas";

type FinanzasStore = {
  ingresos: Ingreso[];
  gastos: Gasto[];
  objetivos: ObjetivosFinancieros;
  patrimonio: Patrimonio;
  agregarIngreso: (ingreso: Ingreso) => void;
  agregarGasto: (gasto: Gasto) => void;
  actualizarObjetivos: (cambios: Partial<ObjetivosFinancieros>) => void;
};

export const useFinanzasStore = create<FinanzasStore>((set) => ({
  ingresos: ingresosIniciales,
  gastos: gastosIniciales,
  objetivos: objetivosIniciales,
  patrimonio: patrimonioInicial,

  agregarIngreso: (ingreso) =>
    set((state) => ({ ingresos: [...state.ingresos, ingreso] })),

  agregarGasto: (gasto) =>
    set((state) => ({ gastos: [...state.gastos, gasto] })),

  actualizarObjetivos: (cambios) =>
    set((state) => ({ objetivos: { ...state.objetivos, ...cambios } })),
}));
