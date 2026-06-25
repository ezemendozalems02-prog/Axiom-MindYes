import type { EventoCalendario, Tarea } from "@/types/accion";

export const HORA_INICIO = 8;
export const HORA_FIN = 20;

export function minutosDesdeMedianoche(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function posicionEnGrilla(horaInicio: string, horaFin: string) {
  const inicioMin = minutosDesdeMedianoche(horaInicio) - HORA_INICIO * 60;
  const finMin = minutosDesdeMedianoche(horaFin) - HORA_INICIO * 60;
  const totalMin = (HORA_FIN - HORA_INICIO) * 60;
  return {
    top: `${(inicioMin / totalMin) * 100}%`,
    height: `${Math.max(((finMin - inicioMin) / totalMin) * 100, 3)}%`,
  };
}

export function getInicioSemana(fecha: Date): Date {
  const d = new Date(fecha);
  const dia = d.getDay();
  const diff = dia === 0 ? -6 : 1 - dia; // lunes como inicio
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function cargaDelDia(
  fechaISO: string,
  tareas: Tarea[],
  eventos: EventoCalendario[]
): "verde" | "ambar" | "rojo" {
  const minutosTareas = tareas
    .filter((t) => t.fechaProgramada === fechaISO && t.estado !== "completado")
    .reduce((acc, t) => acc + t.tiempoEstimadoMin, 0);
  const minutosEventos = eventos
    .filter((e) => e.fecha === fechaISO)
    .reduce(
      (acc, e) =>
        acc + (minutosDesdeMedianoche(e.horaFin) - minutosDesdeMedianoche(e.horaInicio)),
      0
    );
  const total = minutosTareas + minutosEventos;
  if (total >= 300) return "rojo";
  if (total >= 120) return "ambar";
  return "verde";
}

function formatHora(min: number): string {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function calcularBloquesLibres(
  fechaISO: string,
  eventos: EventoCalendario[]
): { inicio: string; fin: string }[] {
  const inicioDia = HORA_INICIO * 60;
  const finDia = HORA_FIN * 60;

  const ocupados = eventos
    .filter((e) => e.fecha === fechaISO)
    .map((e) => ({
      inicio: minutosDesdeMedianoche(e.horaInicio),
      fin: minutosDesdeMedianoche(e.horaFin),
    }))
    .sort((a, b) => a.inicio - b.inicio);

  const libres: { inicio: string; fin: string }[] = [];
  let cursor = inicioDia;

  for (const bloque of ocupados) {
    if (bloque.inicio > cursor) {
      libres.push({ inicio: formatHora(cursor), fin: formatHora(Math.min(bloque.inicio, finDia)) });
    }
    cursor = Math.max(cursor, bloque.fin);
  }
  if (cursor < finDia) {
    libres.push({ inicio: formatHora(cursor), fin: formatHora(finDia) });
  }
  return libres;
}

export function calcularTiempoDisponibleMin(fechaISO: string, eventos: EventoCalendario[]): number {
  return calcularBloquesLibres(fechaISO, eventos).reduce(
    (acc, b) => acc + (minutosDesdeMedianoche(b.fin) - minutosDesdeMedianoche(b.inicio)),
    0
  );
}

export const CARGA_COLOR: Record<string, string> = {
  verde: "bg-success",
  ambar: "bg-warning",
  rojo: "bg-destructive",
};
