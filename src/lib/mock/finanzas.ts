import type { Gasto, Ingreso, Inversion, ObjetivosFinancieros, Patrimonio } from "@/types/finanzas";

export const ingresos: Ingreso[] = [
  { id: "in1", fecha: "2026-05-04", monto: 1800, moneda: "USD", clienteId: "c3", proyectoId: null, categoria: "Honorarios", recurrente: false, estado: "Cobrado" },
  { id: "in2", fecha: "2026-05-15", monto: 1200, moneda: "USD", clienteId: "c1", proyectoId: "p1", categoria: "Honorarios", recurrente: false, estado: "Cobrado" },
  { id: "in3", fecha: "2026-05-28", monto: 1100, moneda: "USD", clienteId: "c1", proyectoId: "p1", categoria: "Honorarios", recurrente: false, estado: "Cobrado" },
  { id: "in4", fecha: "2026-06-05", monto: 1200, moneda: "USD", clienteId: "c1", proyectoId: "p1", categoria: "Honorarios", recurrente: false, estado: "Cobrado" },
  { id: "in5", fecha: "2026-06-12", monto: 800, moneda: "USD", clienteId: "c3", proyectoId: null, categoria: "Mantenimiento", recurrente: true, estado: "Cobrado" },
  { id: "in6", fecha: "2026-06-20", monto: 1200, moneda: "USD", clienteId: "c1", proyectoId: "p1", categoria: "Honorarios", recurrente: false, estado: "Confirmado" },
  { id: "in7", fecha: "2026-07-05", monto: 1200, moneda: "USD", clienteId: "c1", proyectoId: null, categoria: "Mantenimiento", recurrente: true, estado: "Pendiente" },
  { id: "in8", fecha: "2026-07-15", monto: 2500, moneda: "USD", clienteId: "c2", proyectoId: null, categoria: "Honorarios", recurrente: false, estado: "Pendiente" },
];

export const gastos: Gasto[] = [
  { id: "g1", fecha: "2026-06-02", monto: 650, moneda: "USD", categoria: "Vivienda", areaVida: "Organización", tipo: "Fijo" },
  { id: "g2", fecha: "2026-06-03", monto: 45, moneda: "USD", categoria: "Suscripciones", areaVida: "Organización", tipo: "Fijo" },
  { id: "g3", fecha: "2026-06-05", monto: 220, moneda: "USD", categoria: "Alimentación", areaVida: "Salud", tipo: "Variable" },
  { id: "g4", fecha: "2026-06-08", monto: 90, moneda: "USD", categoria: "Transporte", areaVida: "Organización", tipo: "Variable" },
  { id: "g5", fecha: "2026-06-10", monto: 120, moneda: "USD", categoria: "Salud", areaVida: "Salud", tipo: "Variable" },
  { id: "g6", fecha: "2026-06-14", monto: 180, moneda: "USD", categoria: "Alimentación", areaVida: "Salud", tipo: "Variable" },
  { id: "g7", fecha: "2026-06-16", monto: 60, moneda: "USD", categoria: "Ocio", areaVida: "Creatividad", tipo: "Variable" },
  { id: "g8", fecha: "2026-06-20", monto: 75, moneda: "USD", categoria: "Transporte", areaVida: "Organización", tipo: "Variable" },
];

export const inversiones: Inversion[] = [
  { id: "v1", nombre: "Plazo fijo", monto: 1500 },
  { id: "v2", nombre: "FCI money market", monto: 800 },
];

export const objetivosFinancieros: ObjetivosFinancieros = {
  ahorroMensualTarget: 1000,
  ingresoMensualTarget: 5000,
  fondoEmergenciaTarget: 6000,
  fondoEmergenciaActual: 2400,
  inversiones,
};

export const patrimonio: Patrimonio = {
  activos: 18000,
  deudas: 3200,
};
