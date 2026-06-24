import { create } from "zustand";

import type { EstadoHabitoDia, Habito, Revision, Rutina } from "@/types/identidad";
import {
  habitos as habitosIniciales,
  revisiones as revisionesIniciales,
  rutinas as rutinasIniciales,
} from "@/lib/mock/identidad";
import { calcularConsistencia4Semanas, calcularRachaActual } from "@/lib/habitos";

type IdentidadStore = {
  habitos: Habito[];
  rutinas: Rutina[];
  revisiones: Revision[];
  estadoHoy: Record<string, EstadoHabitoDia>;
  marcarHabito: (id: string, estado: EstadoHabitoDia) => void;
  agregarRevision: (revision: Revision) => void;
  reordenarRutina: (rutinaId: string, habitoIds: string[]) => void;
  indiceConsistenciaGlobal: () => number;
};

export const useIdentidadStore = create<IdentidadStore>((set, get) => ({
  habitos: habitosIniciales,
  rutinas: rutinasIniciales,
  revisiones: revisionesIniciales,
  estadoHoy: {},

  marcarHabito: (id, estado) =>
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
          ? { ...h, mejorRacha: rachaNueva, mejorRachaFecha: "2026-06-24" }
          : h
      );

      return { estadoHoy: nuevoEstadoHoy, habitos };
    }),

  agregarRevision: (revision) =>
    set((state) => ({ revisiones: [revision, ...state.revisiones] })),

  reordenarRutina: (rutinaId, habitoIds) =>
    set((state) => ({
      rutinas: state.rutinas.map((r) =>
        r.id === rutinaId ? { ...r, habitoIds } : r
      ),
    })),

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
}));
