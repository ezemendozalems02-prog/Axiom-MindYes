import type { AreaVida } from "@/types/centro-de-control";
import type { Tarea } from "@/types/accion";
import type { Indices } from "@/types/inteligencia";
import { getHoyISO } from "@/lib/hoy";

function clamp(valor: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, valor));
}

function fechasUltimos7Dias(): string[] {
  const hoy = new Date(getHoyISO() + "T00:00:00");
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
}

export function calcularIndiceClaridad(
  pendientesBandejaMental: number,
  decisionesAbiertas: number,
  urgenciasSinFecha: number
): number {
  return clamp(100 - pendientesBandejaMental * 2 - decisionesAbiertas * 5 - urgenciasSinFecha * 3);
}

export function calcularIndiceEjecucion(tareas: Tarea[]): number {
  const dias = fechasUltimos7Dias();
  const criticas = tareas.filter(
    (t) =>
      (t.prioridad === "Crítica" || t.prioridad === "Alta") &&
      t.fechaProgramada &&
      dias.includes(t.fechaProgramada)
  );
  if (criticas.length === 0) return 100;
  const completadas = criticas.filter((t) => t.estado === "completado").length;
  return clamp(Math.round((completadas / criticas.length) * 100));
}

export function calcularIndiceBalance(areas: AreaVida[]): number {
  if (areas.length === 0) return 0;
  return clamp(Math.round(areas.reduce((acc, a) => acc + a.indice, 0) / areas.length));
}

export function calcularIndiceTranquilidad(
  claridad: number,
  consistencia: number,
  ejecucion: number,
  balance: number
): number {
  return clamp(Math.round(claridad * 0.3 + consistencia * 0.25 + ejecucion * 0.25 + balance * 0.2));
}

export function calcularIndices(params: {
  pendientesBandejaMental: number;
  decisionesAbiertas: number;
  urgenciasSinFecha: number;
  tareas: Tarea[];
  consistenciaHabitos: number;
  areasDeVida: AreaVida[];
}): Indices {
  const claridad = calcularIndiceClaridad(
    params.pendientesBandejaMental,
    params.decisionesAbiertas,
    params.urgenciasSinFecha
  );
  const ejecucion = calcularIndiceEjecucion(params.tareas);
  const consistencia = clamp(Math.round(params.consistenciaHabitos));
  const balance = calcularIndiceBalance(params.areasDeVida);
  const tranquilidad = calcularIndiceTranquilidad(claridad, consistencia, ejecucion, balance);

  return { claridad, ejecucion, consistencia, balance, tranquilidad };
}
