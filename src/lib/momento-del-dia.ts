import type { MomentoDelDia } from "@/types/centro-de-control";

export function getMomentoDelDia(date: Date = new Date()): MomentoDelDia {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return "mañana";
  if (hour >= 12 && hour < 18) return "tarde";
  return "noche";
}

export function getSaludo(momento: MomentoDelDia): string {
  if (momento === "mañana") return "Buenos días";
  if (momento === "tarde") return "Buenas tardes";
  return "Buenas noches";
}

export function getFechaLarga(date: Date = new Date()): string {
  const formatted = date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

const FRASES: Record<MomentoDelDia, string> = {
  mañana: "El día está entero por delante. Una sola prioridad, sin dispersarte.",
  tarde: "Ya recorriste la mitad del día. Lo que falta importa más que lo que ya hiciste.",
  noche: "Cerrá el día con intención. Mañana empieza con lo que decidas ahora.",
};

export function getFrasePersonalizada(momento: MomentoDelDia): string {
  return FRASES[momento];
}

export const ORDEN_BLOQUES: Record<MomentoDelDia, string[]> = {
  mañana: ["estado", "indices", "prioridad", "resumen", "areas", "progreso", "inteligencia"],
  tarde: ["prioridad", "resumen", "progreso", "areas", "indices", "estado", "inteligencia"],
  noche: ["resumen", "inteligencia", "indices", "progreso", "areas", "prioridad", "estado"],
};
