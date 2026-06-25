import type { Deuda, Gasto, Ingreso, Inversion, ObjetivosFinancieros, Patrimonio } from "@/types/finanzas";

export const ingresos: Ingreso[] = [];

export const gastos: Gasto[] = [];

export const inversiones: Inversion[] = [];

export const deudas: Deuda[] = [];

export const objetivosFinancieros: ObjetivosFinancieros = {
  ahorroMensualTarget: 0,
  ingresoMensualTarget: 0,
  fondoEmergenciaTarget: 0,
  fondoEmergenciaActual: 0,
  inversiones,
};

export const patrimonio: Patrimonio = {
  activos: 0,
};
