import type { EstadoHabitoDia, Habito, Revision, Rutina } from "@/types/identidad";

function hashDeterministico(seed: number): number {
  // Mezcla tipo xorshift para evitar clustering en hashes basados en strings similares.
  let h = seed ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = h ^ (h >>> 16);
  return ((h >>> 0) % 1000) / 1000;
}

function seedDeHabito(habitoId: string): number {
  let h = 0;
  for (let i = 0; i < habitoId.length; i++) h = h * 131 + habitoId.charCodeAt(i);
  return h;
}

function generarHistorial(
  habitoId: string,
  probabilidadCompletado: number
): Record<string, EstadoHabitoDia> {
  const historial: Record<string, EstadoHabitoDia> = {};
  const hoy = new Date("2026-06-24T00:00:00");
  const seedBase = seedDeHabito(habitoId);
  for (let i = 29; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);
    const y = fecha.getFullYear();
    const m = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const d = fecha.getDate().toString().padStart(2, "0");
    const iso = `${y}-${m}-${d}`;
    if (i === 0) continue; // hoy se marca en vivo
    const score = hashDeterministico(seedBase + i * 7919);
    historial[iso] = score < probabilidadCompletado ? "completado" : "omitido";
  }
  return historial;
}

export const habitos: Habito[] = [
  {
    id: "h1",
    nombre: "Entrenamiento",
    area: "Salud",
    objetivo: "Plan de entrenamiento Q3",
    frecuencia: { tipo: "semanal", vecesPorSemana: 4 },
    horario: "mañana",
    energia: "Alta",
    motivacion: "Sostener energía durante todo el día y construir disciplina.",
    mejorRacha: 18,
    mejorRachaFecha: "2026-05-12",
    historial: generarHistorial("h1", 0.75),
  },
  {
    id: "h2",
    nombre: "Meditación",
    area: "Desarrollo Personal",
    frecuencia: { tipo: "diaria" },
    horario: "mañana",
    energia: "Baja",
    motivacion: "Bajar la carga mental antes de empezar el día.",
    mejorRacha: 9,
    mejorRachaFecha: "2026-04-02",
    historial: generarHistorial("h2", 0.55),
  },
  {
    id: "h3",
    nombre: "Lectura",
    area: "Desarrollo Personal",
    objetivo: "Leer 12 libros este año",
    frecuencia: { tipo: "diaria" },
    horario: "noche",
    energia: "Media",
    motivacion: "Aprender algo nuevo cada día, sin excusas.",
    mejorRacha: 34,
    mejorRachaFecha: "2026-06-20",
    historial: generarHistorial("h3", 0.85),
  },
  {
    id: "h4",
    nombre: "Planificar el día",
    area: "Organización",
    frecuencia: { tipo: "diaria" },
    horario: "mañana",
    energia: "Baja",
    motivacion: "Empezar el día con claridad, no con reacción.",
    mejorRacha: 22,
    mejorRachaFecha: "2026-06-10",
    historial: generarHistorial("h4", 0.8),
  },
  {
    id: "h5",
    nombre: "Cerrar el día sin pantallas",
    area: "Salud",
    frecuencia: { tipo: "personalizada", diasSemana: [0, 1, 2, 3, 4] },
    horario: "noche",
    energia: "Baja",
    motivacion: "Dormir mejor y desconectar la cabeza.",
    mejorRacha: 6,
    mejorRachaFecha: "2026-03-15",
    historial: generarHistorial("h5", 0.4),
  },
];

export const rutinas: Rutina[] = [
  {
    id: "r1",
    nombre: "Rutina matutina",
    momento: "mañana",
    habitoIds: ["h4", "h1", "h2"],
  },
  {
    id: "r2",
    nombre: "Rutina nocturna",
    momento: "noche",
    habitoIds: ["h3", "h5"],
  },
];

export const tiempoEstimadoHabitoMin: Record<string, number> = {
  h1: 45,
  h2: 10,
  h3: 25,
  h4: 10,
  h5: 0,
};

export const revisiones: Revision[] = [
  {
    id: "rev1",
    tipo: "diaria",
    fecha: "2026-06-23",
    respuestas: {
      "¿Qué logré?": "Avancé bastante en la propuesta de Opus Webs.",
      "¿Qué quedó pendiente?": "Responder mails del cliente Y; revisar contrato.",
      "¿Qué aprendí?": "Bloquear la mañana para foco cambia todo.",
      "¿Energía?": "Alta",
      "¿Mañana?": "Cerrar la propuesta antes del mediodía.",
    },
    creadaEn: "2026-06-23T21:10:00",
  },
  {
    id: "rev2",
    tipo: "semanal",
    fecha: "2026-06-21",
    respuestas: {
      Negocio: "Buena semana, 2 propuestas enviadas.",
      Salud: "Bajó la consistencia de entrenamiento.",
      "Hábitos": "Lectura sólida, meditación floja.",
      "Objetivos": "67% en Opus Webs, en línea con lo esperado.",
      "Aprendizajes": "Necesito proteger el bloque de foco de la mañana.",
    },
    creadaEn: "2026-06-21T19:00:00",
  },
];
