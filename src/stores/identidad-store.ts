import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { EstadoHabitoDia, Habito, Revision, Rutina } from "@/types/identidad";
import {
  habitos as habitosIniciales,
  revisiones as revisionesIniciales,
  rutinas as rutinasIniciales,
} from "@/lib/mock/identidad";
import { calcularConsistencia4Semanas, calcularRachaActual } from "@/lib/habitos";
import { getHoyISO } from "@/lib/hoy";
import { crearStorageScopedPorCuenta, esCuentaReal } from "@/lib/storage-por-cuenta";
import { crearSyncJSON } from "@/lib/supabase/jsonb-sync";

type DatosIdentidad = {
  habitos: Habito[];
  rutinas: Rutina[];
  revisiones: Revision[];
  estado_hoy: Record<string, EstadoHabitoDia>;
};

const sync = crearSyncJSON<DatosIdentidad>("identidad_data");

type IdentidadStore = {
  habitos: Habito[];
  rutinas: Rutina[];
  revisiones: Revision[];
  estadoHoy: Record<string, EstadoHabitoDia>;
  cargarDesdeSupabase: () => Promise<void>;
  marcarHabito: (id: string, estado: EstadoHabitoDia) => void;
  agregarRevision: (revision: Revision) => void;
  reordenarRutina: (rutinaId: string, habitoIds: string[]) => void;
  indiceConsistenciaGlobal: () => number;
  agregarHabito: (habito: Habito) => void;
  actualizarHabito: (id: string, cambios: Partial<Habito>) => void;
  eliminarHabito: (id: string) => void;
  agregarRutina: (rutina: Rutina) => void;
  actualizarRutina: (id: string, cambios: Partial<Rutina>) => void;
  eliminarRutina: (id: string) => void;
};

export const useIdentidadStore = create<IdentidadStore>()(
  persist(
    (set, get) => {
      function sincronizar() {
        if (!esCuentaReal()) return;
        const s = get();
        sync.guardar({
          habitos: s.habitos,
          rutinas: s.rutinas,
          revisiones: s.revisiones,
          estado_hoy: s.estadoHoy,
        });
      }

      return {
        habitos: habitosIniciales,
        rutinas: rutinasIniciales,
        revisiones: revisionesIniciales,
        estadoHoy: {},

        cargarDesdeSupabase: async () => {
          if (!esCuentaReal()) return;
          const datos = await sync.cargar();
          if (datos) {
            set({
              habitos: datos.habitos,
              rutinas: datos.rutinas,
              revisiones: datos.revisiones,
              estadoHoy: datos.estado_hoy,
            });
          } else {
            sincronizar();
          }
        },

        marcarHabito: (id, estado) => {
          set((state) => {
            const habito = state.habitos.find((h) => h.id === id);
            const estadoAnterior = state.estadoHoy[id];
            const nuevoEstado =
              estadoAnterior === estado ? "pendiente" : estado;
            const nuevoEstadoHoy = { ...state.estadoHoy, [id]: nuevoEstado };

            if (!habito) return { estadoHoy: nuevoEstadoHoy };

            const rachaNueva = calcularRachaActual(habito, nuevoEstado);
            const habitos = state.habitos.map((h) =>
              h.id === id && rachaNueva > h.mejorRacha
                ? { ...h, mejorRacha: rachaNueva, mejorRachaFecha: getHoyISO() }
                : h
            );

            return { estadoHoy: nuevoEstadoHoy, habitos };
          });
          sincronizar();
        },

        agregarRevision: (revision) => {
          set((state) => ({ revisiones: [revision, ...state.revisiones] }));
          sincronizar();
        },

        reordenarRutina: (rutinaId, habitoIds) => {
          set((state) => ({
            rutinas: state.rutinas.map((r) =>
              r.id === rutinaId ? { ...r, habitoIds } : r
            ),
          }));
          sincronizar();
        },

        indiceConsistenciaGlobal: () => {
          const { habitos, estadoHoy } = get();
          if (habitos.length === 0) return 0;
          const promedio =
            habitos.reduce(
              (acc, h) => acc + calcularConsistencia4Semanas(h, estadoHoy[h.id]),
              0
            ) / habitos.length;
          return Math.round(promedio);
        },

        agregarHabito: (habito) => {
          set((state) => ({ habitos: [...state.habitos, habito] }));
          sincronizar();
        },

        actualizarHabito: (id, cambios) => {
          set((state) => ({
            habitos: state.habitos.map((h) => (h.id === id ? { ...h, ...cambios } : h)),
          }));
          sincronizar();
        },

        eliminarHabito: (id) => {
          set((state) => ({
            habitos: state.habitos.filter((h) => h.id !== id),
            rutinas: state.rutinas.map((r) => ({
              ...r,
              habitoIds: r.habitoIds.filter((hid) => hid !== id),
            })),
          }));
          sincronizar();
        },

        agregarRutina: (rutina) => {
          set((state) => ({ rutinas: [...state.rutinas, rutina] }));
          sincronizar();
        },

        actualizarRutina: (id, cambios) => {
          set((state) => ({
            rutinas: state.rutinas.map((r) => (r.id === id ? { ...r, ...cambios } : r)),
          }));
          sincronizar();
        },

        eliminarRutina: (id) => {
          set((state) => ({ rutinas: state.rutinas.filter((r) => r.id !== id) }));
          sincronizar();
        },
      };
    },
    {
      name: "axiom-mind-identidad",
      storage: createJSONStorage(() => crearStorageScopedPorCuenta()),
    }
  )
);
