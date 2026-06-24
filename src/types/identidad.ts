export type Horario = "mañana" | "tarde" | "noche" | "sin_horario";

export type Energia = "Alta" | "Media" | "Baja";

export type Frecuencia =
  | { tipo: "diaria" }
  | { tipo: "semanal"; vecesPorSemana: number }
  | { tipo: "personalizada"; diasSemana: number[] };

export type EstadoHabitoDia = "completado" | "omitido" | "pendiente";

export type Habito = {
  id: string;
  nombre: string;
  area: string;
  objetivo?: string;
  frecuencia: Frecuencia;
  horario: Horario;
  energia: Energia;
  motivacion: string;
  mejorRacha: number;
  mejorRachaFecha: string | null;
  historial: Record<string, EstadoHabitoDia>; // fechaISO -> estado
};

export type Rutina = {
  id: string;
  nombre: string;
  momento: "mañana" | "noche";
  habitoIds: string[];
};

export type TipoRevision = "diaria" | "semanal" | "mensual";

export type Revision = {
  id: string;
  tipo: TipoRevision;
  fecha: string;
  respuestas: Record<string, string>;
  creadaEn: string;
};
