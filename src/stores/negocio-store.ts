import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Cliente, EstadoOportunidad, Oportunidad } from "@/types/negocio";
import { clientes as clientesIniciales, oportunidades as oportunidadesIniciales } from "@/lib/mock/negocio";
import { crearStorageScopedPorCuenta } from "@/lib/storage-por-cuenta";

type NegocioStore = {
  clientes: Cliente[];
  oportunidades: Oportunidad[];
  agregarCliente: (cliente: Cliente) => void;
  actualizarCliente: (id: string, cambios: Partial<Cliente>) => void;
  registrarReunion: (clienteId: string) => void;
  registrarPropuesta: (clienteId: string) => void;
  agregarOportunidad: (oportunidad: Oportunidad) => void;
  moverOportunidad: (id: string, estado: EstadoOportunidad) => void;
};

export const useNegocioStore = create<NegocioStore>()(
  persist(
    (set) => ({
      clientes: clientesIniciales,
      oportunidades: oportunidadesIniciales,

      agregarCliente: (cliente) =>
        set((state) => ({ clientes: [...state.clientes, cliente] })),

      actualizarCliente: (id, cambios) =>
        set((state) => ({
          clientes: state.clientes.map((c) => (c.id === id ? { ...c, ...cambios } : c)),
        })),

      registrarReunion: (clienteId) =>
        set((state) => ({
          clientes: state.clientes.map((c) =>
            c.id === clienteId
              ? {
                  ...c,
                  reunionesRegistradas: c.reunionesRegistradas + 1,
                  ultimaInteraccion: new Date().toISOString().slice(0, 10),
                }
              : c
          ),
        })),

      registrarPropuesta: (clienteId) =>
        set((state) => ({
          clientes: state.clientes.map((c) =>
            c.id === clienteId
              ? {
                  ...c,
                  propuestasEnviadas: c.propuestasEnviadas + 1,
                  ultimaInteraccion: new Date().toISOString().slice(0, 10),
                }
              : c
          ),
        })),

      agregarOportunidad: (oportunidad) =>
        set((state) => ({ oportunidades: [...state.oportunidades, oportunidad] })),

      moverOportunidad: (id, estado) =>
        set((state) => ({
          oportunidades: state.oportunidades.map((o) =>
            o.id === id
              ? {
                  ...o,
                  estado,
                  cerradaEn:
                    estado === "Cerrado Ganado" || estado === "Cerrado Perdido"
                      ? new Date().toISOString().slice(0, 10)
                      : o.cerradaEn,
                }
              : o
          ),
        })),
    }),
    {
      name: "axiom-mind-negocio",
      storage: createJSONStorage(() => crearStorageScopedPorCuenta()),
    }
  )
);
