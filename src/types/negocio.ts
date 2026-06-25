export type EstadoRelacionCliente = "Prospecto" | "Activo" | "Pausado" | "Inactivo" | "VIP";

export type Cliente = {
  id: string;
  nombre: string;
  empresa: string;
  sector: string;
  email: string;
  telefono: string;
  estado: EstadoRelacionCliente;
  notas: string[];
  archivos: string[];
  reunionesRegistradas: number;
  propuestasEnviadas: number;
  proximaAccion?: string;
  proximaAccionFecha: string | null;
  ultimaInteraccion: string;
  creadoEn: string;
};

export type EstadoOportunidad =
  | "Nuevo Contacto"
  | "Propuesta Enviada"
  | "Negociación"
  | "Cerrado Ganado"
  | "Cerrado Perdido";

export type Oportunidad = {
  id: string;
  clienteId: string;
  titulo: string;
  valorEstimado: number;
  probabilidad: number;
  fechaEstimadaCierre: string | null;
  estado: EstadoOportunidad;
  creadaEn: string;
  cerradaEn: string | null;
};

export const COLUMNAS_PIPELINE: { id: EstadoOportunidad; titulo: string }[] = [
  { id: "Nuevo Contacto", titulo: "Nuevo Contacto" },
  { id: "Propuesta Enviada", titulo: "Propuesta Enviada" },
  { id: "Negociación", titulo: "Negociación" },
  { id: "Cerrado Ganado", titulo: "Cerrado Ganado" },
  { id: "Cerrado Perdido", titulo: "Cerrado Perdido" },
];
