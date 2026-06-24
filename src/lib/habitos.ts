import type { EstadoHabitoDia, Habito } from "@/types/identidad";
import { getHoyISO } from "@/lib/hoy";

function fechaISOHaceNDias(n: number): string {
  const d = new Date("2026-06-24T00:00:00");
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function calcularRachaActual(habito: Habito, estadoHoy?: EstadoHabitoDia): number {
  let racha = 0;
  const hoy = getHoyISO();
  const estadoDeHoy = estadoHoy ?? habito.historial[hoy] ?? "pendiente";

  let offset = 0;
  if (estadoDeHoy === "completado") {
    racha += 1;
    offset = 1;
  } else if (estadoDeHoy === "pendiente") {
    offset = 1;
  } else {
    return 0;
  }

  for (let i = offset; i < 60; i++) {
    const fecha = fechaISOHaceNDias(i);
    const estado = habito.historial[fecha];
    if (estado === "completado") {
      racha += 1;
    } else if (estado === undefined) {
      continue;
    } else {
      break;
    }
  }
  return racha;
}

export function calcularConsistencia4Semanas(
  habito: Habito,
  estadoHoy?: EstadoHabitoDia
): number {
  const hoy = getHoyISO();
  const estadoDeHoy = estadoHoy ?? habito.historial[hoy] ?? "pendiente";
  let completados = estadoDeHoy === "completado" ? 1 : 0;
  let total = 1;

  for (let i = 1; i < 28; i++) {
    const fecha = fechaISOHaceNDias(i);
    const estado = habito.historial[fecha];
    if (estado === undefined) continue;
    total += 1;
    if (estado === "completado") completados += 1;
  }

  return total > 0 ? Math.round((completados / total) * 100) : 0;
}

export function generarHeatmap30Dias(
  habito: Habito,
  estadoHoy?: EstadoHabitoDia
): { fecha: string; estado: EstadoHabitoDia }[] {
  const hoy = getHoyISO();
  const estadoDeHoy = estadoHoy ?? habito.historial[hoy] ?? "pendiente";
  const dias: { fecha: string; estado: EstadoHabitoDia }[] = [];
  for (let i = 29; i >= 0; i--) {
    const fecha = fechaISOHaceNDias(i);
    const estado = i === 0 ? estadoDeHoy : habito.historial[fecha] ?? "omitido";
    dias.push({ fecha, estado });
  }
  return dias;
}
