export type ClasificacionBandeja =
  | "Idea"
  | "Tarea"
  | "Decisión"
  | "Nota"
  | "Pregunta"
  | "Preocupación";

export type ItemBandejaMental = {
  id: string;
  texto: string;
  creadaEn: string;
};

export type PotencialIdea = "Baja" | "Media" | "Alta" | "Transformadora";

export type EstadoIdea = "Nueva" | "En análisis" | "Convertida" | "Archivada" | "Descartada";

export type Idea = {
  id: string;
  titulo: string;
  descripcion: string;
  area: string;
  potencial: PotencialIdea;
  estado: EstadoIdea;
  relacionado?: string;
  origen: string;
  fecha: string;
  accionesPosibles: string[];
};

export type OpcionDecision = {
  nombre: string;
  pros: string[];
  contras: string[];
};

export type ImpactoDecision = "Alto" | "Medio" | "Bajo";

export type EstadoDecision = "Abierta" | "En análisis" | "Tomada" | "Descartada";

export type Decision = {
  id: string;
  problema: string;
  opciones: OpcionDecision[];
  impacto: ImpactoDecision;
  costoRiesgo: string;
  estado: EstadoDecision;
  fechaLimite: string | null;
  resultado?: string;
  reflexion?: string;
  creadaEn: string;
};

export type VinculoNota = {
  tipo: "proyecto" | "cliente" | "area" | "objetivo";
  valor: string;
} | null;

export type Nota = {
  id: string;
  titulo: string;
  contenido: string;
  vinculo: VinculoNota;
  creadaEn: string;
};
