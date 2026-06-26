import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Cliente, EstadoOportunidad, Oportunidad } from "@/types/negocio";
import { clientes as clientesIniciales, oportunidades as oportunidadesIniciales } from "@/lib/mock/negocio";
import { crearStorageScopedPorCuenta, esCuentaReal } from "@/lib/storage-por-cuenta";
import { crearSyncJSON } from "@/lib/supabase/jsonb-sync";

type DatosNegocio = {
  clientes: Cliente[];
  oportunidades: Oportunidad[];
};

const sync = crearSyncJSON<DatosNegocio>("negocio_data");

type NegocioStore = {
  clientes: Cliente[];
  oportunidades: Oportunidad[];
  cargarDesdeSupabase: () => Promise<void>;
  agregarCliente: (cliente: Cliente) => void;
  actualizarCliente: (id: string, cambios: Partial<Cliente>) => void;
  registrarReunion: (clienteId: string) => void;
  registrarPropuesta: (clienteId: string) => void;
  agregarOportunidad: (oportunidad: Oportunidad) => void;
  moverOportunidad: (id: string, estado: EstadoOportunidad) => void;
};

export const useNegocioStore = create<NegocioStore>()(
  persist(
    (set, get) => {
      function sincronizar() {
        if (!esCuentaReal()) return;
        const s = get();
        sync.guardar({ clientes: s.clientes, oportunidades: s.oportunidades });
      }

      return {
        clientes: clientesIniciales,
        oportunidades: oportunidadesIniciales,

        cargarDesdeSupabase: async () => {
          if (!esCuentaReal()) return;
          const datos = await sync.cargar();
          if (datos) set({ clientes: datos.clientes, oportunidades: datos.oportunidades });
          else sincronizar();
        },

        agregarCliente: (cliente) => {
          set((state) => ({ clientes: [...state.clientes, cliente] }));
          sincronizar();
        },

        actualizarCliente: (id, cambios) => {
          set((state) => ({
            clientes: state.clientes.map((c) => (c.id === id ? { ...c, ...cambios } : c)),
          }));
          sincronizar();
        },

        registrarReunion: (clienteId) => {
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
          }));
          sincronizar();
        },

        registrarPropuesta: (clienteId) => {
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
          }));
          sincronizar();
        },

        agregarOportunidad: (oportunidad) => {
          set((state) => ({ oportunidades: [...state.oportunidades, oportunidad] }));
          sincronizar();
        },

        moverOportunidad: (id, estado) => {
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
          }));
          sincronizar();
        },
      };
    },
    {
      name: "axiom-mind-negocio",
      storage: createJSONStorage(() => crearStorageScopedPorCuenta()),
    }
  )
);
