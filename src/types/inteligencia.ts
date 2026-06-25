export type TipoInsightMotor =
  | "accion_inmediata"
  | "accion_del_dia"
  | "accion_estrategica"
  | "accion_bienestar";

export type InsightMotor = {
  id: string;
  tipo: TipoInsightMotor;
  texto: string;
};

export type Indices = {
  claridad: number;
  ejecucion: number;
  consistencia: number;
  balance: number;
  tranquilidad: number;
};

export type NivelesMotor = {
  observacion: string[];
  comprension: string[];
  interpretacion: string[];
  prediccion: string[];
  recomendacion: InsightMotor[];
};

export type AnalisisSemanal = {
  id: string;
  semanaInicio: string;
  semanaFin: string;
  resumen: string;
  logros: string[];
  areasAtencion: string[];
  patrones: string[];
  recomendaciones: string[];
  comparativa: string;
  indices: Indices;
  creadoEn: string;
};
