export type VisionPersonal = {
  vision: string;
  valores: string[];
  proposito: string;
  identidadFutura: string;
  actualizadoEn: string;
};

export type NivelObjetivo = "Vital" | "Anual" | "Trimestral" | "Mensual" | "Semanal" | "Diario";

export const NIVELES_OBJETIVO: NivelObjetivo[] = [
  "Vital",
  "Anual",
  "Trimestral",
  "Mensual",
  "Semanal",
  "Diario",
];

export type EstadoObjetivo = "Activo" | "Cumplido" | "Pospuesto" | "Abandonado";

export type Objetivo = {
  id: string;
  titulo: string;
  descripcion: string;
  nivel: NivelObjetivo;
  area: string;
  objetivoPadreId: string | null;
  proyectosIds: string[];
  habitosIds: string[];
  metricasExito: string[];
  fechaLimite: string | null;
  estado: EstadoObjetivo;
  motivacion: string;
  obstaculos: string[];
  recursos: string[];
  creadoEn: string;
};

export type FrecuenciaMedicion = "diaria" | "semanal" | "mensual";

export type ValorHistorico = {
  fecha: string;
  valor: number;
};

export type Meta = {
  id: string;
  nombre: string;
  objetivoId: string | null;
  area: string;
  valorActual: number;
  valorObjetivo: number;
  unidad: string;
  frecuencia: FrecuenciaMedicion;
  historial: ValorHistorico[];
  fuente: "finanzas" | "identidad" | "accion" | "manual";
};

export type EventoAnual = {
  id: string;
  titulo: string;
  fecha: string;
  mes: number;
};

export type HitoMes = {
  mes: number;
  objetivosIds: string[];
  hitos: string[];
  proyectosPlanificados: string[];
  cargaEstimada: "Baja" | "Media" | "Alta";
};

export type PlanAnual = {
  anio: number;
  meses: HitoMes[];
  eventosClave: EventoAnual[];
};

export type RevisionSemanaAnterior = {
  queAvanzo: string;
  queQuedoPendiente: string;
  queAprendiste: string;
  areaDescuidada: string;
};

export type FocoSemana = {
  objetivoPrincipal: string;
  proyectoPrioritario: string;
  pendientePostergado: string;
};

export type PlanificacionSemana = {
  objetivosSemanaIds: string[];
  proyectosActivosIds: string[];
  bloqueoTiempo: string;
  habitosPrioritarios: string[];
};

export type PreparacionMental = {
  preocupacion: string;
  porResolver: string;
  comoQuiereSentirse: string;
};

export type PlanSemanal = {
  id: string;
  semanaInicio: string;
  semanaFin: string;
  revisionAnterior: RevisionSemanaAnterior;
  foco: FocoSemana;
  planificacion: PlanificacionSemana;
  preparacionMental: PreparacionMental;
  completado: boolean;
  creadoEn: string;
};

export type RevisionMensual = {
  id: string;
  mes: string;
  resultados: {
    objetivosCumplidos: string[];
    objetivosNoCumplidos: string[];
    queAvanzo: string;
    queSeEstanco: string;
    indiceConsistenciaHabitos: number;
    ingresosVsObjetivo: string;
    gastosVsPresupuesto: string;
  };
  aprendizajes: {
    queFunciono: string;
    queNoFunciono: string;
    queCambiarias: string;
    queDescubriste: string;
  };
  ajusteDeCurso: {
    objetivosAModificar: string;
    habitosAAjustar: string;
    prioridadesQueCambiaron: string;
  };
  intencionProximoMes: {
    palabraDelMes: string;
    objetivosPrincipales: string[];
    queNecesitasDiferente: string;
  };
  creadaEn: string;
};

export type EstadoFase = "completada" | "en_curso" | "pendiente";

export type FaseRoadmap = {
  id: string;
  nombre: string;
  duracionDias: number;
  inicioEstimado: string;
  finEstimado: string;
  estado: EstadoFase;
  hitos: { titulo: string; fecha: string; criterioExito: string; cumplido: boolean }[];
  dependeDeFaseId: string | null;
  recursos: string[];
  progresoReal: number;
  progresoPlanificado: number;
};

export type Roadmap = {
  id: string;
  proyectoId: string;
  nombre: string;
  fases: FaseRoadmap[];
};
