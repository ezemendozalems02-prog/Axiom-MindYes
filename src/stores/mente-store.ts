import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Decision, Idea, ItemBandejaMental, Nota } from "@/types/mente";
import type { Tarea } from "@/types/accion";
import {
  bandejaMental as bandejaInicial,
  decisiones as decisionesIniciales,
  ideas as ideasIniciales,
  notas as notasIniciales,
} from "@/lib/mock/mente";
import { useAccionStore } from "@/stores/accion-store";
import { crearStorageScopedPorCuenta } from "@/lib/storage-por-cuenta";

function tareaBase(titulo: string, area: string): Tarea {
  return {
    id: crypto.randomUUID(),
    titulo,
    estado: "sin_empezar",
    prioridad: "Media",
    impacto: "Medio",
    urgencia: "Normal",
    energia: "Media",
    tiempoEstimadoMin: 30,
    tiempoRealMin: 0,
    proyectoId: null,
    objetivoId: null,
    area,
    etiquetas: [],
    dependenciasIds: [],
    fechaLimite: null,
    fechaProgramada: null,
    recurrencia: null,
    delegacion: null,
    bandeja: true,
    creadaEn: new Date().toISOString(),
  };
}

type MenteStore = {
  bandeja: ItemBandejaMental[];
  ideas: Idea[];
  decisiones: Decision[];
  notas: Nota[];

  capturar: (texto: string) => void;
  eliminarDeBandeja: (id: string) => void;
  clasificarComoTarea: (id: string) => void;
  clasificarComoIdea: (id: string, datos: Partial<Idea>) => void;
  clasificarComoDecision: (id: string, datos: Partial<Decision>) => void;
  clasificarComoNota: (id: string, datos: Partial<Nota>) => void;

  agregarIdea: (idea: Idea) => void;
  actualizarIdea: (id: string, cambios: Partial<Idea>) => void;
  convertirIdea: (id: string, destino: "Proyecto" | "Tarea" | "Objetivo" | "Nota" | "Decisión") => void;

  agregarDecision: (decision: Decision) => void;
  actualizarDecision: (id: string, cambios: Partial<Decision>) => void;
  tomarDecision: (id: string, resultado: string) => void;
  generarTareasDeImplementacion: (id: string, titulos: string[]) => void;

  agregarNota: (nota: Nota) => void;
  actualizarNota: (id: string, cambios: Partial<Nota>) => void;
  eliminarNota: (id: string) => void;
};

export const useMenteStore = create<MenteStore>()(
  persist(
    (set, get) => ({
    bandeja: bandejaInicial,
    ideas: ideasIniciales,
    decisiones: decisionesIniciales,
    notas: notasIniciales,
  
    capturar: (texto) =>
      set((state) => ({
        bandeja: [
          { id: crypto.randomUUID(), texto, creadaEn: new Date().toISOString() },
          ...state.bandeja,
        ],
      })),
  
    eliminarDeBandeja: (id) =>
      set((state) => ({ bandeja: state.bandeja.filter((i) => i.id !== id) })),
  
    clasificarComoTarea: (id) => {
      const item = get().bandeja.find((i) => i.id === id);
      if (!item) return;
      useAccionStore.getState().agregarTarea(tareaBase(item.texto, "Organización"));
      get().eliminarDeBandeja(id);
    },
  
    clasificarComoIdea: (id, datos) => {
      const item = get().bandeja.find((i) => i.id === id);
      if (!item) return;
      const idea: Idea = {
        id: crypto.randomUUID(),
        titulo: item.texto,
        descripcion: "",
        area: "Organización",
        potencial: "Media",
        estado: "Nueva",
        origen: "Bandeja mental",
        fecha: new Date().toISOString().slice(0, 10),
        accionesPosibles: [],
        ...datos,
      };
      set((state) => ({ ideas: [idea, ...state.ideas] }));
      get().eliminarDeBandeja(id);
    },
  
    clasificarComoDecision: (id, datos) => {
      const item = get().bandeja.find((i) => i.id === id);
      if (!item) return;
      const decision: Decision = {
        id: crypto.randomUUID(),
        problema: item.texto,
        opciones: [],
        impacto: "Medio",
        costoRiesgo: "",
        estado: "Abierta",
        fechaLimite: null,
        creadaEn: new Date().toISOString(),
        ...datos,
      };
      set((state) => ({ decisiones: [decision, ...state.decisiones] }));
      get().eliminarDeBandeja(id);
    },
  
    clasificarComoNota: (id, datos) => {
      const item = get().bandeja.find((i) => i.id === id);
      if (!item) return;
      const nota: Nota = {
        id: crypto.randomUUID(),
        titulo: item.texto,
        contenido: "",
        vinculo: null,
        creadaEn: new Date().toISOString(),
        ...datos,
      };
      set((state) => ({ notas: [nota, ...state.notas] }));
      get().eliminarDeBandeja(id);
    },
  
    agregarIdea: (idea) => set((state) => ({ ideas: [idea, ...state.ideas] })),
  
    actualizarIdea: (id, cambios) =>
      set((state) => ({
        ideas: state.ideas.map((i) => (i.id === id ? { ...i, ...cambios } : i)),
      })),
  
    convertirIdea: (id, destino) => {
      const idea = get().ideas.find((i) => i.id === id);
      if (!idea) return;
  
      if (destino === "Tarea") {
        const tarea = tareaBase(idea.titulo, idea.area);
        tarea.descripcion = idea.descripcion;
        useAccionStore.getState().agregarTarea(tarea);
      } else if (destino === "Proyecto") {
        useAccionStore.getState().agregarProyecto({
          id: crypto.randomUUID(),
          nombre: idea.titulo,
          area: idea.area,
          tipo: "Propio",
          progreso: 0,
          fechaLimite: null,
          estado: "en_curso",
        });
      } else if (destino === "Nota") {
        get().agregarNota({
          id: crypto.randomUUID(),
          titulo: idea.titulo,
          contenido: idea.descripcion,
          vinculo: null,
          creadaEn: new Date().toISOString(),
        });
      } else if (destino === "Decisión") {
        get().agregarDecision({
          id: crypto.randomUUID(),
          problema: idea.titulo,
          opciones: [],
          impacto: "Medio",
          costoRiesgo: "",
          estado: "Abierta",
          fechaLimite: null,
          creadaEn: new Date().toISOString(),
        });
      }
      // "Objetivo" se modela como tarea estratégica hasta que exista el módulo Dirección.
  
      get().actualizarIdea(id, { estado: "Convertida" });
    },
  
    agregarDecision: (decision) =>
      set((state) => ({ decisiones: [decision, ...state.decisiones] })),
  
    actualizarDecision: (id, cambios) =>
      set((state) => ({
        decisiones: state.decisiones.map((d) => (d.id === id ? { ...d, ...cambios } : d)),
      })),
  
    tomarDecision: (id, resultado) =>
      get().actualizarDecision(id, { estado: "Tomada", resultado }),
  
    generarTareasDeImplementacion: (id, titulos) => {
      const decision = get().decisiones.find((d) => d.id === id);
      if (!decision) return;
      titulos.forEach((titulo) => {
        useAccionStore.getState().agregarTarea(tareaBase(titulo, "Organización"));
      });
    },
  
    agregarNota: (nota) => set((state) => ({ notas: [nota, ...state.notas] })),
  
    actualizarNota: (id, cambios) =>
      set((state) => ({
        notas: state.notas.map((n) => (n.id === id ? { ...n, ...cambios } : n)),
      })),
  
    eliminarNota: (id) =>
      set((state) => ({ notas: state.notas.filter((n) => n.id !== id) })),
    }),
    {
      name: "axiom-mind-mente",
      storage: createJSONStorage(() => crearStorageScopedPorCuenta()),
    }
  )
);
