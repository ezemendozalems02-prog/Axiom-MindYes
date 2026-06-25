export type EstadoTarea =
  | "sin_empezar"
  | "en_progreso"
  | "bloqueado"
  | "completado"
  | "archivado";

export type Prioridad = "Crítica" | "Alta" | "Media" | "Baja";

export type Impacto = "Alto" | "Medio" | "Bajo";

export type Urgencia = "Alta" | "Normal";

export type Energia = "Alta" | "Media" | "Baja";

export type Etiqueta =
  | "Alta Energía"
  | "Trabajo Profundo"
  | "Delegable"
  | "Administrativo"
  | "Creativo"
  | "Estratégico";

export type Recurrencia = "diaria" | "semanal" | "mensual" | "personalizada" | null;

export type Delegacion = {
  delegadoA: string;
  fechaSeguimiento: string;
} | null;

export type Tarea = {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: EstadoTarea;
  prioridad: Prioridad;
  impacto: Impacto;
  urgencia: Urgencia;
  energia: Energia;
  tiempoEstimadoMin: number;
  tiempoRealMin: number;
  proyectoId: string | null;
  objetivoId: string | null;
  area: string;
  etiquetas: Etiqueta[];
  dependenciasIds: string[];
  fechaLimite: string | null;
  fechaProgramada: string | null;
  notas?: string;
  recurrencia: Recurrencia;
  delegacion: Delegacion;
  bandeja: boolean;
  creadaEn: string;
};

export type EstadoProyecto = "en_curso" | "pausado" | "completado";

export type TipoProyecto = "Propio" | "Cliente";

export type Proyecto = {
  id: string;
  nombre: string;
  area: string;
  tipo: TipoProyecto;
  cliente?: string;
  clienteId?: string | null;
  progreso: number;
  fechaLimite: string | null;
  estado: EstadoProyecto;
};

export type Archivo = {
  id: string;
  proyectoId: string;
  nombre: string;
  tipo: string;
  agregadoEn: string;
};

export type EventoCalendario = {
  id: string;
  titulo: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string;
  horaFin: string;
  tipo: "evento" | "bloque_foco" | "tarea";
};

export const COLUMNAS_KANBAN: { id: EstadoTarea; titulo: string }[] = [
  { id: "sin_empezar", titulo: "Sin Empezar" },
  { id: "en_progreso", titulo: "En Progreso" },
  { id: "bloqueado", titulo: "Bloqueado" },
  { id: "completado", titulo: "Completado" },
];
