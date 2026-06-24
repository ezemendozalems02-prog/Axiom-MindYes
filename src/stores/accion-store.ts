import { create } from "zustand";

import type { EstadoTarea, Proyecto, Tarea } from "@/types/accion";
import { proyectos as proyectosIniciales, tareas as tareasIniciales } from "@/lib/mock/accion";

type AccionStore = {
  tareas: Tarea[];
  proyectos: Proyecto[];
  agregarTarea: (tarea: Tarea) => void;
  agregarProyecto: (proyecto: Proyecto) => void;
  actualizarTarea: (id: string, cambios: Partial<Tarea>) => void;
  eliminarTarea: (id: string) => void;
  moverEstado: (id: string, estado: EstadoTarea) => void;
  toggleCompletada: (id: string) => void;
  registrarTiempo: (id: string, minutos: number) => void;
};

export const useAccionStore = create<AccionStore>((set) => ({
  tareas: tareasIniciales,
  proyectos: proyectosIniciales,

  agregarTarea: (tarea) =>
    set((state) => ({ tareas: [...state.tareas, tarea] })),

  agregarProyecto: (proyecto) =>
    set((state) => ({ proyectos: [...state.proyectos, proyecto] })),

  actualizarTarea: (id, cambios) =>
    set((state) => ({
      tareas: state.tareas.map((t) => (t.id === id ? { ...t, ...cambios } : t)),
    })),

  eliminarTarea: (id) =>
    set((state) => ({ tareas: state.tareas.filter((t) => t.id !== id) })),

  moverEstado: (id, estado) =>
    set((state) => ({
      tareas: state.tareas.map((t) => (t.id === id ? { ...t, estado } : t)),
    })),

  toggleCompletada: (id) =>
    set((state) => ({
      tareas: state.tareas.map((t) =>
        t.id === id
          ? { ...t, estado: t.estado === "completado" ? "sin_empezar" : "completado" }
          : t
      ),
    })),

  registrarTiempo: (id, minutos) =>
    set((state) => ({
      tareas: state.tareas.map((t) =>
        t.id === id ? { ...t, tiempoRealMin: t.tiempoRealMin + minutos } : t
      ),
    })),
}));
