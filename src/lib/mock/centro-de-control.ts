import type { AreaVida } from "@/types/centro-de-control";

export const usuario = {
  nombre: "Neo",
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
