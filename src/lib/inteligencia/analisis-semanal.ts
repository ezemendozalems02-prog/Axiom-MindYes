import type { AreaVida } from "@/types/centro-de-control";
import type { AnalisisSemanal, Indices, NivelesMotor } from "@/types/inteligencia";
import type { Habito } from "@/types/identidad";
import { getHoyISO } from "@/lib/hoy";

export const TRANQUILIDAD_SEMANA_ANTERIOR = 64;

function getInicioSemanaISO(hoy: string): string {
  const d = new Date(hoy + "T00:00:00");
  const dia = d.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  return getHoyISO(d);
}

export function generarAnalisisSemanal(datos: {
  hoy: string;
  indices: Indices;
  niveles: NivelesMotor;
  habitos: Habito[];
  estadoHoyHabitos: Record<string, string>;
  areasDeVida: AreaVida[];
  tareasCompletadasSemana: number;
  tareasTotalesSemana: number;
  ingresosSemana: number;
}): AnalisisSemanal {
  const { hoy, indices, niveles, habitos, areasDeVida, tareasCompletadasSemana, tareasTotalesSemana, ingresosSemana } = datos;
  const inicio = getInicioSemanaISO(hoy);

  const racha7 = habitos.filter((h) => h.mejorRacha >= 7);

  const logros: string[] = [
    `Completaste ${tareasCompletadasSemana} de ${tareasTotalesSemana} tareas planificadas esta semana.`,
  ];
  if (ingresosSemana > 0) {
    logros.push(`Generaste $${ingresosSemana.toLocaleString("es-AR")} en ingresos esta semana.`);
  }
  racha7.forEach((h) => logros.push(`Sostuviste "${h.nombre}" con una racha de ${h.mejorRacha} días.`));

  const areasAtencion = areasDeVida
    .filter((a) => a.tendencia === "down")
    .map((a) => `${a.nombre}: ${a.observacion}`);
  if (areasAtencion.length === 0) {
    areasAtencion.push("Ninguna área de vida muestra una caída relevante esta semana.");
  }

  const diferencia = indices.tranquilidad - TRANQUILIDAD_SEMANA_ANTERIOR;
  const comparativa =
    diferencia === 0
      ? `Tu Índice de Tranquilidad se mantuvo igual a la semana anterior (${indices.tranquilidad}).`
      : diferencia > 0
        ? `Tu Índice de Tranquilidad subió ${diferencia} puntos respecto a la semana anterior (${TRANQUILIDAD_SEMANA_ANTERIOR} → ${indices.tranquilidad}).`
        : `Tu Índice de Tranquilidad bajó ${Math.abs(diferencia)} puntos respecto a la semana anterior (${TRANQUILIDAD_SEMANA_ANTERIOR} → ${indices.tranquilidad}).`;

  const resumen = `Esta semana tu ejecución fue del ${indices.ejecucion}%, tu consistencia de hábitos del ${indices.consistencia}% y tu balance general de ${indices.balance}/100. ${comparativa}`;

  return {
    id: crypto.randomUUID(),
    semanaInicio: inicio,
    semanaFin: hoy,
    resumen,
    logros,
    areasAtencion,
    patrones: niveles.interpretacion,
    recomendaciones: niveles.recomendacion.map((r) => r.texto),
    comparativa,
    indices,
    creadoEn: new Date().toISOString(),
  };
}
