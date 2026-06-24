import type {
  AreaVida,
  EstadoGeneral,
  Insight,
  PrioridadAbsoluta,
  Progreso,
  ResumenDelDia,
} from "@/types/centro-de-control";

export const usuario = {
  nombre: "Neo",
};

export const estadoGeneral: EstadoGeneral = {
  energia: "Alta",
  foco: 78,
  cargaMental: 54,
  balance: 70,
};

export const prioridadAbsoluta: PrioridadAbsoluta = {
  titulo: "Cerrar propuesta cliente X",
  proyecto: "Opus Webs",
  objetivo: "Asegurar 3 nuevos clientes este trimestre",
  area: "Negocio",
  tiempoEstimadoMin: 120,
  impacto: "Alto",
};

export const resumenDelDia: ResumenDelDia = {
  tareasCriticas: [
    { id: "t1", titulo: "Cerrar propuesta cliente X", hora: "10:00" },
    { id: "t2", titulo: "Revisar diseño Opus Webs", hora: "13:00" },
    { id: "t3", titulo: "Llamada con proveedor", hora: "16:30" },
  ],
  habitos: [
    { id: "h1", nombre: "Entrenamiento", completadoHoy: true, racha: 4 },
    { id: "h2", nombre: "Meditación", completadoHoy: false, racha: 0 },
    { id: "h3", nombre: "Lectura", completadoHoy: true, racha: 12 },
  ],
  eventos: [
    { id: "e1", titulo: "Llamada con proveedor", hora: "16:30" },
    { id: "e2", titulo: "Revisión semanal", hora: "18:00" },
  ],
  tiempoDisponibleMin: 320,
  bloquesLibres: [
    { inicio: "09:00", fin: "10:00" },
    { inicio: "14:00", fin: "16:00" },
  ],
};

export const areasDeVida: AreaVida[] = [
  {
    id: "negocio",
    nombre: "Negocio",
    indice: 88,
    tendencia: "up",
    actualizado: "Hoy",
    observacion: "Tu mejor semana del mes en cierre de propuestas.",
  },
  {
    id: "finanzas",
    nombre: "Finanzas",
    indice: 74,
    tendencia: "flat",
    actualizado: "Ayer",
    observacion: "Gasto estable, dentro del presupuesto mensual.",
  },
  {
    id: "salud",
    nombre: "Salud",
    indice: 62,
    tendencia: "down",
    actualizado: "Hoy",
    observacion: "Esta semana perdiste consistencia en entrenamiento.",
  },
  {
    id: "aprendizaje",
    nombre: "Desarrollo Personal",
    indice: 55,
    tendencia: "down",
    actualizado: "Hace 2 días",
    observacion: "Llevás 3 días sin avanzar en lectura.",
  },
  {
    id: "relaciones",
    nombre: "Relaciones",
    indice: 80,
    tendencia: "up",
    actualizado: "Hace 1 día",
    observacion: "Buena conexión con tu equipo esta semana.",
  },
  {
    id: "creatividad",
    nombre: "Creatividad",
    indice: 48,
    tendencia: "flat",
    actualizado: "Hace 4 días",
    observacion: "Sin proyectos creativos activos por ahora.",
  },
  {
    id: "organizacion",
    nombre: "Organización",
    indice: 67,
    tendencia: "up",
    actualizado: "Hoy",
    observacion: "Tu bandeja mental bajó de 14 a 6 pendientes.",
  },
  {
    id: "proposito",
    nombre: "Propósito",
    indice: 71,
    tendencia: "flat",
    actualizado: "Hace 3 días",
    observacion: "Sin revisión de visión en las últimas 2 semanas.",
  },
];

export const progreso: Progreso = {
  objetivos: [
    { id: "o1", nombre: "Asegurar 3 nuevos clientes este trimestre", progreso: 67 },
    { id: "o2", nombre: "Leer 12 libros este año", progreso: 41 },
  ],
  proyectos: [
    { id: "p1", nombre: "Opus Webs", progreso: 67 },
    { id: "p2", nombre: "Rediseño de marca personal", progreso: 23 },
  ],
  rachas: [
    { habito: "Entrenamiento", dias: 4 },
    { habito: "Lectura", dias: 12 },
  ],
  ingresos: { actual: 3200, objetivo: 5000 },
};

export const insights: Insight[] = [
  {
    id: "i1",
    tipo: "logro",
    texto: "Terminaste el 80% de tus tareas importantes hoy.",
  },
  {
    id: "i2",
    tipo: "alerta",
    texto: "Hace 4 días que no avanzás en Rediseño de marca personal.",
  },
  {
    id: "i3",
    tipo: "patron",
    texto: "Tu mejor horario de foco es 9:00–11:30.",
  },
  {
    id: "i4",
    tipo: "alerta",
    texto: "Tu bandeja mental tiene 6 pendientes sin resolver.",
  },
  {
    id: "i5",
    tipo: "recomendacion",
    texto: "Reservá el bloque libre de 14:00–16:00 para Lectura.",
  },
];
