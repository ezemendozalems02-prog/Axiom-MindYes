import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Meta, Objetivo, PlanSemanal, RevisionMensual, VisionPersonal } from "@/types/direccion";
import {
  metas as metasIniciales,
  objetivos as objetivosIniciales,
  planesSemanales as planesSemanalesIniciales,
  revisionesMensuales as revisionesMensualesIniciales,
  visionPersonal as visionInicial,
} from "@/lib/mock/direccion";
import { crearStorageScopedPorCuenta } from "@/lib/storage-por-cuenta";

type DireccionStore = {
  vision: VisionPersonal;
  objetivos: Objetivo[];
  metas: Meta[];
  planesSemanales: PlanSemanal[];
  revisionesMensuales: RevisionMensual[];
  actualizarVision: (cambios: Partial<VisionPersonal>) => void;
  agregarObjetivo: (objetivo: Objetivo) => void;
  actualizarObjetivo: (id: string, cambios: Partial<Objetivo>) => void;
  eliminarObjetivo: (id: string) => void;
  agregarMeta: (meta: Meta) => void;
  registrarValorMeta: (id: string, valor: number, fecha: string) => void;
  agregarPlanSemanal: (plan: PlanSemanal) => void;
  agregarRevisionMensual: (revision: RevisionMensual) => void;
};

export const useDireccionStore = create<DireccionStore>()(
  persist(
    (set) => ({
      vision: visionInicial,
      objetivos: objetivosIniciales,
      metas: metasIniciales,
      planesSemanales: planesSemanalesIniciales,
      revisionesMensuales: revisionesMensualesIniciales,

      actualizarVision: (cambios) =>
        set((state) => ({ vision: { ...state.vision, ...cambios } })),

      agregarObjetivo: (objetivo) =>
        set((state) => ({ objetivos: [...state.objetivos, objetivo] })),

      actualizarObjetivo: (id, cambios) =>
        set((state) => ({
          objetivos: state.objetivos.map((o) => (o.id === id ? { ...o, ...cambios } : o)),
        })),

      eliminarObjetivo: (id) =>
        set((state) => ({ objetivos: state.objetivos.filter((o) => o.id !== id) })),

      agregarMeta: (meta) =>
        set((state) => ({ metas: [...state.metas, meta] })),

      registrarValorMeta: (id, valor, fecha) =>
        set((state) => ({
          metas: state.metas.map((m) =>
            m.id === id
              ? { ...m, valorActual: valor, historial: [...m.historial, { fecha, valor }] }
              : m
          ),
        })),

      agregarPlanSemanal: (plan) =>
        set((state) => ({ planesSemanales: [plan, ...state.planesSemanales] })),

      agregarRevisionMensual: (revision) =>
        set((state) => ({ revisionesMensuales: [revision, ...state.revisionesMensuales] })),
    }),
    {
      name: "axiom-mind-direccion",
      storage: createJSONStorage(() => crearStorageScopedPorCuenta()),
    }
  )
);
