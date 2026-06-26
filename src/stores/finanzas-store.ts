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
import { crearStorageScopedPorCuenta, esCuentaReal } from "@/lib/storage-por-cuenta";
import { crearSyncJSON } from "@/lib/supabase/jsonb-sync";

type DatosFinanzas = {
  ingresos: Ingreso[];
  gastos: Gasto[];
  deudas: Deuda[];
  objetivos: ObjetivosFinancieros;
  patrimonio: Patrimonio;
};

const sync = crearSyncJSON<DatosFinanzas>("finanzas_data");

type FinanzasStore = {
  ingresos: Ingreso[];
  gastos: Gasto[];
  deudas: Deuda[];
  objetivos: ObjetivosFinancieros;
  patrimonio: Patrimonio;
  cargarDesdeSupabase: () => Promise<void>;
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
    (set, get) => {
      function sincronizar() {
        if (!esCuentaReal()) return;
        const s = get();
        sync.guardar({
          ingresos: s.ingresos,
          gastos: s.gastos,
          deudas: s.deudas,
          objetivos: s.objetivos,
          patrimonio: s.patrimonio,
        });
      }

      return {
        ingresos: ingresosIniciales,
        gastos: gastosIniciales,
        deudas: deudasIniciales,
        objetivos: objetivosIniciales,
        patrimonio: patrimonioInicial,

        cargarDesdeSupabase: async () => {
          if (!esCuentaReal()) return;
          const datos = await sync.cargar();
          if (datos) {
            set({
              ingresos: datos.ingresos,
              gastos: datos.gastos,
              deudas: datos.deudas,
              objetivos: datos.objetivos,
              patrimonio: datos.patrimonio,
            });
          } else {
            sincronizar();
          }
        },

        agregarIngreso: (ingreso) => {
          set((state) => ({ ingresos: [...state.ingresos, ingreso] }));
          sincronizar();
        },

        agregarGasto: (gasto) => {
          set((state) => ({ gastos: [...state.gastos, gasto] }));
          sincronizar();
        },

        agregarDeuda: (deuda) => {
          set((state) => ({ deudas: [...state.deudas, deuda] }));
          sincronizar();
        },

        registrarPagoDeuda: (id, monto, fecha) => {
          set((state) => ({
            deudas: state.deudas.map((d) => {
              if (d.id !== id) return d;
              const pagos = [...d.pagos, { fecha, monto }];
              const pagado = pagos.reduce((acc, p) => acc + p.monto, 0);
              return { ...d, pagos, estado: pagado >= d.montoOriginal ? "Pagada" : "Activa" };
            }),
          }));
          sincronizar();
        },

        eliminarDeuda: (id) => {
          set((state) => ({ deudas: state.deudas.filter((d) => d.id !== id) }));
          sincronizar();
        },

        actualizarObjetivos: (cambios) => {
          set((state) => ({ objetivos: { ...state.objetivos, ...cambios } }));
          sincronizar();
        },

        agregarInversion: (inversion) => {
          set((state) => ({
            objetivos: { ...state.objetivos, inversiones: [...state.objetivos.inversiones, inversion] },
          }));
          sincronizar();
        },

        eliminarInversion: (id) => {
          set((state) => ({
            objetivos: {
              ...state.objetivos,
              inversiones: state.objetivos.inversiones.filter((i) => i.id !== id),
            },
          }));
          sincronizar();
        },

        actualizarPatrimonio: (cambios) => {
          set((state) => ({ patrimonio: { ...state.patrimonio, ...cambios } }));
          sincronizar();
        },
      };
    },
    {
      name: "axiom-mind-finanzas",
      storage: createJSONStorage(() => crearStorageScopedPorCuenta()),
    }
  )
);
