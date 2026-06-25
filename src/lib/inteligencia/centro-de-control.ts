import type { EstadoGeneral, Insight, NivelEnergia, Progreso, PrioridadAbsoluta } from "@/types/centro-de-control";
import type { Indices, NivelesMotor } from "@/types/inteligencia";
import type { Habito as HabitoIdentidad, EstadoHabitoDia } from "@/types/identidad";
import type { Meta, Objetivo } from "@/types/direccion";
import type { Proyecto, Tarea } from "@/types/accion";
import type { Ingreso, ObjetivosFinancieros } from "@/types/finanzas";
import { calcularProgresoObjetivo } from "@/lib/direccion";
import { calcularProgresoProyecto } from "@/lib/accion-format";
import { calcularRachaActual } from "@/lib/habitos";
import { mesDe, sumarIngresosDelMes } from "@/lib/finanzas";

function nivelEnergiaDe(valor: number): NivelEnergia {
  if (valor >= 81) return "Excelente";
  if (valor >= 61) return "Alta";
  if (valor >= 41) return "Media";
  if (valor >= 21) return "Baja";
  return "Muy baja";
}

export function calcularEstadoGeneral(indices: Indices): EstadoGeneral {
  return {
    energia: nivelEnergiaDe(Math.round((indices.ejecucion + indices.tranquilidad) / 2)),
    foco: indices.ejecucion,
    cargaMental: 100 - indices.claridad,
    balance: indices.balance,
  };
}

export function nivelesAInsights(niveles: NivelesMotor): Insight[] {
  const insights: Insight[] = [];

  niveles.observacion
    .filter((texto) => texto.startsWith("Logro:") || texto.startsWith("Racha:"))
    .forEach((texto, i) => insights.push({ id: `logro-${i}`, tipo: "logro", texto }));

  niveles.comprension
    .filter((texto) => texto !== "No se detectaron caídas simultáneas relevantes en los últimos días.")
    .forEach((texto, i) => insights.push({ id: `alerta-${i}`, tipo: "alerta", texto }));

  niveles.interpretacion.forEach((texto, i) =>
    insights.push({ id: `patron-${i}`, tipo: "patron", texto })
  );

  niveles.recomendacion.forEach((r) =>
    insights.push({ id: r.id, tipo: "recomendacion", texto: r.texto })
  );

  return insights;
}

export function calcularPrioridadAbsolutaEnVivo(
  tarea: Tarea | undefined,
  proyectos: Proyecto[],
  objetivos: Objetivo[]
): PrioridadAbsoluta {
  if (!tarea) {
    return {
      titulo: "No tenés una prioridad crítica para hoy",
      proyecto: "",
      objetivo: "",
      area: "",
      tiempoEstimadoMin: 0,
      impacto: "Bajo",
    };
  }
  const proyecto = proyectos.find((p) => p.id === tarea.proyectoId);
  const objetivo = objetivos.find((o) => o.id === tarea.objetivoId);
  return {
    titulo: tarea.titulo,
    proyecto: proyecto?.nombre ?? "",
    objetivo: objetivo?.titulo ?? "",
    area: tarea.area,
    tiempoEstimadoMin: tarea.tiempoEstimadoMin,
    impacto: tarea.impacto,
  };
}

export function calcularProgresoEnVivo(datos: {
  objetivos: Objetivo[];
  metas: Meta[];
  proyectos: Proyecto[];
  tareas: Tarea[];
  habitos: HabitoIdentidad[];
  estadoHoyHabitos: Record<string, EstadoHabitoDia>;
  ingresos: Ingreso[];
  objetivosFinancieros: ObjetivosFinancieros;
  hoy: string;
}): Progreso {
  const { objetivos, metas, proyectos, tareas, habitos, estadoHoyHabitos, ingresos, objetivosFinancieros, hoy } = datos;

  const objetivosActivos = objetivos
    .filter((o) => o.estado === "Activo")
    .slice(0, 3)
    .map((o) => ({ id: o.id, nombre: o.titulo, progreso: calcularProgresoObjetivo(o.id, objetivos, metas) }));

  const proyectosEnCurso = proyectos
    .filter((p) => p.estado === "en_curso")
    .slice(0, 3)
    .map((p) => ({ id: p.id, nombre: p.nombre, progreso: calcularProgresoProyecto(p.id, tareas) }));

  const rachas = habitos
    .map((h) => ({ habito: h.nombre, dias: calcularRachaActual(h, estadoHoyHabitos[h.id]) }))
    .filter((r) => r.dias > 0)
    .sort((a, b) => b.dias - a.dias)
    .slice(0, 4);

  const ingresosMes = sumarIngresosDelMes(ingresos, mesDe(hoy));

  return {
    objetivos: objetivosActivos,
    proyectos: proyectosEnCurso,
    rachas,
    ingresos: { actual: ingresosMes, objetivo: objetivosFinancieros.ingresoMensualTarget || 1 },
  };
}
