import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Archivo, EstadoTarea, EventoCalendario, Proyecto, Tarea } from "@/types/accion";
import {
  eventosCalendario as eventosCalendarioIniciales,
  proyectos as proyectosIniciales,
  tareas as tareasIniciales,
} from "@/lib/mock/accion";
import { crearStorageScopedPorCuenta, esCuentaReal } from "@/lib/storage-por-cuenta";
import {
  fetchAccionDesdeSupabase,
  syncActualizarProyecto,
  syncActualizarTarea,
  syncCrearProyecto,
  syncCrearTarea,
  syncEliminarProyecto,
  syncEliminarTarea,
} from "@/lib/supabase/accion-sync";

type AccionStore = {
  tareas: Tarea[];
  proyectos: Proyecto[];
  archivos: Archivo[];
  eventosCalendario: EventoCalendario[];
  cargarDesdeSupabase: () => Promise<void>;
  agregarTarea: (tarea: Tarea) => void;
  agregarProyecto: (proyecto: Proyecto) => void;
  actualizarProyecto: (id: string, cambios: Partial<Proyecto>) => void;
  eliminarProyecto: (id: string) => void;
  actualizarTarea: (id: string, cambios: Partial<Tarea>) => void;
  eliminarTarea: (id: string) => void;
  moverEstado: (id: string, estado: EstadoTarea) => void;
  toggleCompletada: (id: string) => void;
  registrarTiempo: (id: string, minutos: number) => void;
  agregarArchivo: (archivo: Archivo) => void;
  eliminarArchivo: (id: string) => void;
  agregarEvento: (evento: EventoCalendario) => void;
  eliminarEvento: (id: string) => void;
};

export const useAccionStore = create<AccionStore>()(
  persist(
    (set, get) => ({
      tareas: tareasIniciales,
      proyectos: proyectosIniciales,
      archivos: [],
      eventosCalendario: eventosCalendarioIniciales,

      cargarDesdeSupabase: async () => {
        if (!esCuentaReal()) return;
        const datos = await fetchAccionDesdeSupabase();
        if (datos) set({ tareas: datos.tareas, proyectos: datos.proyectos });
      },

      agregarTarea: (tarea) => {
        set((state) => ({ tareas: [...state.tareas, tarea] }));
        if (esCuentaReal()) syncCrearTarea(tarea);
      },

      agregarProyecto: (proyecto) => {
        set((state) => ({ proyectos: [...state.proyectos, proyecto] }));
        if (esCuentaReal()) syncCrearProyecto(proyecto);
      },

      actualizarProyecto: (id, cambios) => {
        set((state) => ({
          proyectos: state.proyectos.map((p) => (p.id === id ? { ...p, ...cambios } : p)),
        }));
        if (esCuentaReal()) syncActualizarProyecto(id, cambios);
      },

      eliminarProyecto: (id) => {
        set((state) => ({
          proyectos: state.proyectos.filter((p) => p.id !== id),
          tareas: state.tareas.map((t) => (t.proyectoId === id ? { ...t, proyectoId: null } : t)),
        }));
        if (esCuentaReal()) syncEliminarProyecto(id);
      },

      actualizarTarea: (id, cambios) => {
        set((state) => ({
          tareas: state.tareas.map((t) => (t.id === id ? { ...t, ...cambios } : t)),
        }));
        if (esCuentaReal()) syncActualizarTarea(id, cambios);
      },

      eliminarTarea: (id) => {
        set((state) => ({ tareas: state.tareas.filter((t) => t.id !== id) }));
        if (esCuentaReal()) syncEliminarTarea(id);
      },

      moverEstado: (id, estado) => {
        set((state) => ({
          tareas: state.tareas.map((t) => (t.id === id ? { ...t, estado } : t)),
        }));
        if (esCuentaReal()) syncActualizarTarea(id, { estado });
      },

      toggleCompletada: (id) => {
        const actual = get().tareas.find((t) => t.id === id);
        if (!actual) return;
        const nuevoEstado: EstadoTarea = actual.estado === "completado" ? "sin_empezar" : "completado";
        set((state) => ({
          tareas: state.tareas.map((t) => (t.id === id ? { ...t, estado: nuevoEstado } : t)),
        }));
        if (esCuentaReal()) syncActualizarTarea(id, { estado: nuevoEstado });
      },

      registrarTiempo: (id, minutos) => {
        const actual = get().tareas.find((t) => t.id === id);
        if (!actual) return;
        const tiempoRealMin = actual.tiempoRealMin + minutos;
        set((state) => ({
          tareas: state.tareas.map((t) => (t.id === id ? { ...t, tiempoRealMin } : t)),
        }));
        if (esCuentaReal()) syncActualizarTarea(id, { tiempoRealMin });
      },

      agregarArchivo: (archivo) =>
        set((state) => ({ archivos: [...state.archivos, archivo] })),

      eliminarArchivo: (id) =>
        set((state) => ({ archivos: state.archivos.filter((a) => a.id !== id) })),

      agregarEvento: (evento) =>
        set((state) => ({ eventosCalendario: [...state.eventosCalendario, evento] })),

      eliminarEvento: (id) =>
        set((state) => ({
          eventosCalendario: state.eventosCalendario.filter((e) => e.id !== id),
        })),
    }),
    {
      name: "axiom-mind-accion",
      storage: createJSONStorage(() => crearStorageScopedPorCuenta()),
    }
  )
);
