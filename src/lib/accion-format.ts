import type { Energia, Prioridad, Tarea } from "@/types/accion";

export const PRIORIDAD_COLOR: Record<Prioridad, string> = {
  Crítica: "bg-destructive/15 text-destructive",
  Alta: "bg-warning/15 text-warning",
  Media: "bg-primary/15 text-primary",
  Baja: "bg-muted text-text-secondary",
};

export const ENERGIA_COLOR: Record<Energia, string> = {
  Alta: "text-warning",
  Media: "text-primary",
  Baja: "text-text-muted",
};

export function formatMinutos(min: number) {
  if (min <= 0) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  return `${h}h${m > 0 ? ` ${m}min` : ""}`;
}

export function formatFechaCorta(fecha: string | null) {
  if (!fecha) return null;
  const d = new Date(fecha + "T00:00:00");
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export function calcularProgresoProyecto(proyectoId: string, tareas: Tarea[]): number {
  const delProyecto = tareas.filter((t) => t.proyectoId === proyectoId && !t.bandeja);
  if (delProyecto.length === 0) return 0;
  const completadas = delProyecto.filter((t) => t.estado === "completado").length;
  return Math.round((completadas / delProyecto.length) * 100);
}
