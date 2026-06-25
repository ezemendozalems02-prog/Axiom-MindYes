import type { Objetivo, Meta } from "@/types/direccion";
import type { Tarea } from "@/types/accion";
import { getHoyISO } from "@/lib/hoy";

export function calcularProgresoObjetivo(objetivoId: string, objetivos: Objetivo[], metas: Meta[] = []): number {
  const obj = objetivos.find((o) => o.id === objetivoId);
  if (obj?.estado === "Cumplido") return 100;
  if (obj?.estado === "Abandonado") return 0;

  const hijos = objetivos.filter((o) => o.objetivoPadreId === objetivoId);
  if (hijos.length === 0) {
    const meta = metas.find((m) => m.objetivoId === objetivoId);
    if (meta && meta.valorObjetivo > 0) {
      return Math.min(100, Math.round((meta.valorActual / meta.valorObjetivo) * 100));
    }
    return 35;
  }
  const promedio =
    hijos.reduce((acc, h) => acc + calcularProgresoObjetivo(h.id, objetivos, metas), 0) / hijos.length;
  return Math.round(promedio);
}

export function hijosDe(objetivoId: string, objetivos: Objetivo[]): Objetivo[] {
  return objetivos.filter((o) => o.objetivoPadreId === objetivoId);
}

export function raicesDe(objetivos: Objetivo[]): Objetivo[] {
  return objetivos.filter((o) => o.objetivoPadreId === null);
}

export function calcularTendenciaMeta(meta: Meta): "up" | "down" | "flat" {
  if (meta.historial.length < 2) return "flat";
  const ultimo = meta.historial[meta.historial.length - 1].valor;
  const anterior = meta.historial[meta.historial.length - 2].valor;
  if (ultimo > anterior) return "up";
  if (ultimo < anterior) return "down";
  return "flat";
}

function fechasUltimos7Dias(): string[] {
  const hoy = new Date(getHoyISO() + "T00:00:00");
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - i);
    return getHoyISO(d);
  });
}

export function calcularIndiceDireccion(objetivos: Objetivo[], tareas: Tarea[]): number {
  const activos = objetivos.filter((o) => o.estado === "Activo");
  if (activos.length === 0) return 0;
  const dias = fechasUltimos7Dias();
  const conAvanceReciente = activos.filter((o) => {
    const tareasDelObjetivo = tareas.filter(
      (t) => o.proyectosIds.includes(t.proyectoId ?? "") || t.objetivoId === o.id
    );
    return tareasDelObjetivo.some(
      (t) => t.estado === "completado" && t.fechaProgramada && dias.includes(t.fechaProgramada)
    );
  });
  return Math.round((conAvanceReciente.length / activos.length) * 100);
}

export function calcularAlineacion(objetivos: Objetivo[], tareas: Tarea[]): number {
  const tareasSemana = tareas.filter((t) => !t.bandeja);
  if (tareasSemana.length === 0) return 0;
  const proyectosConObjetivo = new Set(objetivos.flatMap((o) => o.proyectosIds));
  const rastreables = tareasSemana.filter(
    (t) => (t.proyectoId && proyectosConObjetivo.has(t.proyectoId)) || Boolean(t.objetivoId)
  );
  return Math.round((rastreables.length / tareasSemana.length) * 100);
}

export function calcularBrechaVisionAccion(
  objetivos: Objetivo[],
  tareas: Tarea[]
): { area: string; pesoObjetivos: number; pesoTiempo: number; brecha: number }[] {
  const areas = Array.from(new Set(objetivos.map((o) => o.area)));
  const totalObjetivos = objetivos.length || 1;
  const tiempoTotal = tareas.reduce((acc, t) => acc + t.tiempoRealMin, 0) || 1;

  return areas
    .map((area) => {
      const pesoObjetivos = Math.round(
        (objetivos.filter((o) => o.area === area).length / totalObjetivos) * 100
      );
      const tiempoArea = tareas.filter((t) => t.area === area).reduce((acc, t) => acc + t.tiempoRealMin, 0);
      const pesoTiempo = Math.round((tiempoArea / tiempoTotal) * 100);
      return { area, pesoObjetivos, pesoTiempo, brecha: Math.abs(pesoObjetivos - pesoTiempo) };
    })
    .sort((a, b) => b.brecha - a.brecha);
}
