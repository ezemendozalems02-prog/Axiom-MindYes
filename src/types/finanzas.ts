export type Moneda = "ARS" | "USD";

export type EstadoIngreso = "Confirmado" | "Pendiente" | "Cobrado";

export type Ingreso = {
  id: string;
  fecha: string;
  monto: number;
  moneda: Moneda;
  clienteId?: string | null;
  proyectoId?: string | null;
  categoria: string;
  recurrente: boolean;
  estado: EstadoIngreso;
};

export type TipoGasto = "Fijo" | "Variable";

export type Gasto = {
  id: string;
  fecha: string;
  monto: number;
  moneda: Moneda;
  categoria: string;
  areaVida: string;
  tipo: TipoGasto;
};

export type Inversion = {
  id: string;
  nombre: string;
  monto: number;
};

export type ObjetivosFinancieros = {
  ahorroMensualTarget: number;
  ingresoMensualTarget: number;
  fondoEmergenciaTarget: number;
  fondoEmergenciaActual: number;
  inversiones: Inversion[];
};

export type Patrimonio = {
  activos: number;
  deudas: number;
};
