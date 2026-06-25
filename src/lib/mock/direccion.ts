import type {
  HitoMes,
  Meta,
  Objetivo,
  PlanAnual,
  PlanSemanal,
  Roadmap,
  RevisionMensual,
  VisionPersonal,
} from "@/types/direccion";

export const visionPersonal: VisionPersonal = {
  vision: "",
  valores: [],
  proposito: "",
  identidadFutura: "",
  actualizadoEn: "",
};

export const objetivos: Objetivo[] = [];

export const metas: Meta[] = [];

function mesVacio(mes: number): HitoMes {
  return { mes, objetivosIds: [], hitos: [], proyectosPlanificados: [], cargaEstimada: "Media" };
}

export const planAnual: PlanAnual = {
  anio: 2026,
  meses: Array.from({ length: 12 }, (_, i) => mesVacio(i + 1)),
  eventosClave: [],
};

export const planesSemanales: PlanSemanal[] = [];

export const revisionesMensuales: RevisionMensual[] = [];

export const roadmaps: Roadmap[] = [];
