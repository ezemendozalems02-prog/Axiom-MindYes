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
import { crearStorageScopedPorCuenta, esCuentaReal } from "@/lib/storage-por-cuenta";
import { crearSyncJSON } from "@/lib/supabase/jsonb-sync";

type DatosDireccion = {
  vision: VisionPersonal;
  objetivos: Objetivo[];
  metas: Meta[];
  planes_semanales: PlanSemanal[];
  revisiones_mensuales: RevisionMensual[];
};

const sync = crearSyncJSON<DatosDireccion>("direccion_data");

type DireccionStore = {
  vision: VisionPersonal;
  objetivos: Objetivo[];
  metas: Meta[];
  planesSemanales: PlanSemanal[];
  revisionesMensuales: RevisionMensual[];
  cargarDesdeSupabase: () => Promise<void>;
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
    (set, get) => {
      function sincronizar() {
        if (!esCuentaReal()) return;
        const s = get();
        sync.guardar({
          vision: s.vision,
          objetivos: s.objetivos,
          metas: s.metas,
          planes_semanales: s.planesSemanales,
          revisiones_mensuales: s.revisionesMensuales,
        });
      }

      return {
        vision: visionInicial,
        objetivos: objetivosIniciales,
        metas: metasIniciales,
        planesSemanales: planesSemanalesIniciales,
        revisionesMensuales: revisionesMensualesIniciales,

        cargarDesdeSupabase: async () => {
          if (!esCuentaReal()) return;
          const datos = await sync.cargar();
          if (datos) {
            set({
              vision: datos.vision,
              objetivos: datos.objetivos,
              metas: datos.metas,
              planesSemanales: datos.planes_semanales,
              revisionesMensuales: datos.revisiones_mensuales,
            });
          } else {
            // Primera vez de esta cuenta en Supabase: subimos lo que ya hay en local.
            sincronizar();
          }
        },

        actualizarVision: (cambios) => {
          set((state) => ({ vision: { ...state.vision, ...cambios } }));
          sincronizar();
        },

        agregarObjetivo: (objetivo) => {
          set((state) => ({ objetivos: [...state.objetivos, objetivo] }));
          sincronizar();
        },

        actualizarObjetivo: (id, cambios) => {
          set((state) => ({
            objetivos: state.objetivos.map((o) => (o.id === id ? { ...o, ...cambios } : o)),
          }));
          sincronizar();
        },

        eliminarObjetivo: (id) => {
          set((state) => ({ objetivos: state.objetivos.filter((o) => o.id !== id) }));
          sincronizar();
        },

        agregarMeta: (meta) => {
          set((state) => ({ metas: [...state.metas, meta] }));
          sincronizar();
        },

        registrarValorMeta: (id, valor, fecha) => {
          set((state) => ({
            metas: state.metas.map((m) =>
              m.id === id
                ? { ...m, valorActual: valor, historial: [...m.historial, { fecha, valor }] }
                : m
            ),
          }));
          sincronizar();
        },

        agregarPlanSemanal: (plan) => {
          set((state) => ({ planesSemanales: [plan, ...state.planesSemanales] }));
          sincronizar();
        },

        agregarRevisionMensual: (revision) => {
          set((state) => ({ revisionesMensuales: [revision, ...state.revisionesMensuales] }));
          sincronizar();
        },
      };
    },
    {
      name: "axiom-mind-direccion",
      storage: createJSONStorage(() => crearStorageScopedPorCuenta()),
    }
  )
);
