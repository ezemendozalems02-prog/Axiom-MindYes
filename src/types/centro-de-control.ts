export type NivelEnergia = "Muy baja" | "Baja" | "Media" | "Alta" | "Excelente";

export type Impacto = "Alto" | "Medio" | "Bajo";

export type Tendencia = "up" | "down" | "flat";

export type EstadoGeneral = {
  energia: NivelEnergia;
  foco: number; // 0-100
  cargaMental: number; // 0-100
  balance: number; // 0-100
};

export type PrioridadAbsoluta = {
  titulo: string;
  proyecto: string;
  objetivo: string;
  area: string;
  tiempoEstimadoMin: number;
  impacto: Impacto;
};

export type TareaCritica = {
  id: string;
  titulo: string;
  hora?: string;
};

export type Habito = {
  id: string;
  nombre: string;
  completadoHoy: boolean;
  racha: number;
};

export type EventoDia = {
  id: string;
  titulo: string;
  hora: string;
};

export type ResumenDelDia = {
  tareasCriticas: TareaCritica[];
  habitos: Habito[];
  eventos: EventoDia[];
  tiempoDisponibleMin: number;
  bloquesLibres: { inicio: string; fin: string }[];
};

export type AreaVida = {
  id: string;
  nombre: string;
  indice: number; // 0-100
  tendencia: Tendencia;
  actualizado: string;
  observacion: string;
};

export type ObjetivoProgreso = {
  id: string;
  nombre: string;
  progreso: number;
};

export type ProyectoProgreso = {
  id: string;
  nombre: string;
  progreso: number;
};

export type Progreso = {
  objetivos: ObjetivoProgreso[];
  proyectos: ProyectoProgreso[];
  rachas: { habito: string; dias: number }[];
  ingresos: { actual: number; objetivo: number };
};

export type TipoInsight = "alerta" | "logro" | "patron" | "recomendacion";

export type Insight = {
  id: string;
  tipo: TipoInsight;
  texto: string;
};

export type MomentoDelDia = "mañana" | "tarde" | "noche";
