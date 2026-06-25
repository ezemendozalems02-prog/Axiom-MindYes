import type { Proyecto, Tarea } from "@/types/accion";
import type { EstadoHabitoDia, Habito } from "@/types/identidad";
import type { Decision, ItemBandejaMental } from "@/types/mente";
import type { Deuda, Gasto, Ingreso, ObjetivosFinancieros } from "@/types/finanzas";
import type { Indices, InsightMotor, NivelesMotor } from "@/types/inteligencia";
import { calcularConsistencia4Semanas, calcularRachaActual } from "@/lib/habitos";
import {
  calcularDiasHastaVencimiento,
  calcularRatioDeudaIngreso,
  mesDe,
  sumarIngresosDelMes,
} from "@/lib/finanzas";

const DIAS_PROYECTO_ESTANCADO = 4;

function diasDesde(fechaISO: string, hoy: string): number {
  const a = new Date(hoy + "T00:00:00");
  const b = new Date(fechaISO.slice(0, 10) + "T00:00:00");
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function proyectoEstancado(
  proyecto: Proyecto,
  tareas: Tarea[],
  hoy: string
): { estancado: boolean; dias: number } {
  const tareasProyecto = tareas.filter((t) => t.proyectoId === proyecto.id);
  const ultimaCompletada = tareasProyecto
    .filter((t) => t.estado === "completado")
    .sort((a, b) => b.creadaEn.localeCompare(a.creadaEn))[0];
  const referencia = ultimaCompletada?.creadaEn ?? proyecto.fechaLimite ?? hoy;
  const dias = diasDesde(referencia, hoy);
  return { estancado: dias >= DIAS_PROYECTO_ESTANCADO && proyecto.estado === "en_curso", dias };
}

export function generarNivelesMotor(datos: {
  tareas: Tarea[];
  proyectos: Proyecto[];
  habitos: Habito[];
  estadoHoyHabitos: Record<string, EstadoHabitoDia>;
  bandejaMental: ItemBandejaMental[];
  decisiones: Decision[];
  ingresos: Ingreso[];
  gastos: Gasto[];
  deudas: Deuda[];
  objetivos: ObjetivosFinancieros;
  indices: Indices;
  hoy: string;
}): NivelesMotor {
  const {
    tareas,
    proyectos,
    habitos,
    estadoHoyHabitos,
    bandejaMental,
    decisiones,
    ingresos,
    deudas,
    objetivos,
    indices,
    hoy,
  } = datos;

  const tareasHoy = tareas.filter((t) => t.fechaProgramada === hoy && !t.bandeja);
  const tareasCompletadasHoy = tareasHoy.filter((t) => t.estado === "completado").length;
  const habitosCompletadosHoy = habitos.filter(
    (h) => (estadoHoyHabitos[h.id] ?? "pendiente") === "completado"
  ).length;
  const tiempoInvertidoHoy = tareasHoy.reduce((acc, t) => acc + t.tiempoRealMin, 0);
  const mesActual = mesDe(hoy);
  const ingresosMes = sumarIngresosDelMes(ingresos, mesActual);

  // Nivel 1 — Observación
  const observacion = [
    `${tareasCompletadasHoy}/${tareasHoy.length} tareas completadas hoy.`,
    `${habitosCompletadosHoy}/${habitos.length} hábitos completados hoy.`,
    `${tiempoInvertidoHoy} min de trabajo invertidos hoy.`,
    `$${ingresosMes.toLocaleString("es-AR")} ingresados este mes.`,
    `${bandejaMental.length} pendientes sin clasificar en la bandeja mental.`,
  ];

  if (objetivos.ingresoMensualTarget > 0 && ingresosMes >= objetivos.ingresoMensualTarget) {
    observacion.push(
      `Logro: superaste tu objetivo de ingresos mensual de $${objetivos.ingresoMensualTarget.toLocaleString("es-AR")}.`
    );
  }

  habitos.forEach((h) => {
    const racha = calcularRachaActual(h, estadoHoyHabitos[h.id]);
    if (racha > 0 && racha % 7 === 0) {
      observacion.push(`Racha: llevás ${racha} días seguidos con "${h.nombre}".`);
    }
  });

  // Nivel 2 — Comprensión
  const comprension: string[] = [];
  if (indices.ejecucion < 60 && indices.consistencia < 60) {
    comprension.push(
      "Tu ejecución bajó y tu consistencia de hábitos también — es probable que estén relacionadas."
    );
  }
  if (bandejaMental.length > 5 && indices.claridad < 70) {
    comprension.push(
      "Tu carga mental está alta: la bandeja mental acumulada está bajando tu índice de claridad."
    );
  }
  const deudasVencidas = deudas.filter(
    (d) => d.estado === "Activa" && calcularDiasHastaVencimiento(d, hoy) < 0
  );
  const ratioDeudaIngreso = calcularRatioDeudaIngreso(deudas, ingresosMes);
  if (deudasVencidas.length > 0) {
    comprension.push(
      `Tenés ${deudasVencidas.length} deuda(s) vencida(s) sin pagar: ${deudasVencidas.map((d) => d.nombre).join(", ")}.`
    );
  } else if (ratioDeudaIngreso > 40) {
    comprension.push(
      `Tus cuotas de deuda representan el ${ratioDeudaIngreso}% de tu ingreso mensual — nivel de endeudamiento crítico.`
    );
  }
  if (comprension.length === 0) {
    comprension.push("No se detectaron caídas simultáneas relevantes en los últimos días.");
  }

  // Nivel 3 — Interpretación
  const interpretacion: string[] = [];
  const habitoMasConsistente = [...habitos].sort(
    (a, b) =>
      calcularConsistencia4Semanas(b, estadoHoyHabitos[b.id]) -
      calcularConsistencia4Semanas(a, estadoHoyHabitos[a.id])
  )[0];
  if (habitoMasConsistente) {
    interpretacion.push(
      `Tu hábito más consistente es "${habitoMasConsistente.nombre}" con ${calcularConsistencia4Semanas(habitoMasConsistente, estadoHoyHabitos[habitoMasConsistente.id])}%.`
    );
  }
  const proyectosEstancados = proyectos
    .map((p) => ({ proyecto: p, ...proyectoEstancado(p, tareas, hoy) }))
    .filter((p) => p.estancado);
  proyectosEstancados.forEach((p) => {
    interpretacion.push(`"${p.proyecto.nombre}" lleva ${p.dias} días sin avances registrados.`);
  });
  interpretacion.push("Tu mejor horario de foco suele ser 9:00–11:30.");

  // Nivel 4 — Predicción
  const prediccion: string[] = [];
  const diaDelMes = Number(hoy.slice(8, 10));
  const ritmoProyectado = (ingresosMes / Math.max(diaDelMes, 1)) * 30;
  if (objetivos.ingresoMensualTarget > 0 && ritmoProyectado < objetivos.ingresoMensualTarget) {
    prediccion.push(
      `Si mantenés este ritmo de ingresos no llegás al objetivo mensual de $${objetivos.ingresoMensualTarget.toLocaleString("es-AR")}.`
    );
  }
  proyectosEstancados.forEach((p) => {
    prediccion.push(`"${p.proyecto.nombre}" puede retrasarse si no se retoma esta semana.`);
  });
  prediccion.push("Tu energía suele bajar alrededor de las 17:00.");

  // Nivel 5 — Recomendación
  const recomendacion: InsightMotor[] = [];

  const tareaRapida = tareasHoy.find(
    (t) => t.estado !== "completado" && t.tiempoEstimadoMin > 0 && t.tiempoEstimadoMin <= 10
  );
  recomendacion.push({
    id: "rec-inmediata",
    tipo: "accion_inmediata",
    texto: deudasVencidas[0]
      ? `Pagá "${deudasVencidas[0].nombre}" — está vencida desde hace ${Math.abs(calcularDiasHastaVencimiento(deudasVencidas[0], hoy))} día(s).`
      : tareaRapida
        ? `Hacé esto ahora, te toma menos de 5 minutos: "${tareaRapida.titulo}".`
        : bandejaMental.length > 0
          ? `Vaciá tu bandeja mental: tenés ${bandejaMental.length} pendiente(s) sin clasificar.`
          : "No hay acciones inmediatas pendientes. Buen trabajo.",
  });

  const tareaDelDia = [...tareasHoy]
    .filter((t) => t.estado !== "completado")
    .sort((a, b) => (a.prioridad === "Crítica" ? -1 : 0) - (b.prioridad === "Crítica" ? -1 : 0))[0];
  recomendacion.push({
    id: "rec-del-dia",
    tipo: "accion_del_dia",
    texto: tareaDelDia
      ? `Tu acción más importante de hoy es "${tareaDelDia.titulo}".`
      : "Ya completaste lo más importante de hoy.",
  });

  const decisionVieja = [...decisiones]
    .filter((d) => d.estado === "Abierta" || d.estado === "En análisis")
    .sort((a, b) => diasDesde(b.creadaEn, hoy) - diasDesde(a.creadaEn, hoy))[0];
  recomendacion.push({
    id: "rec-estrategica",
    tipo: "accion_estrategica",
    texto: proyectosEstancados[0]
      ? `Retomá "${proyectosEstancados[0].proyecto.nombre}" antes de que el atraso se acumule.`
      : decisionVieja
        ? `Tomá la decisión pendiente: "${decisionVieja.problema}".`
        : "Tus proyectos y decisiones están al día. Es buen momento para planificar el próximo paso estratégico.",
  });

  const habitoBienestarPendiente = habitos.find(
    (h) =>
      (estadoHoyHabitos[h.id] ?? "pendiente") !== "completado" &&
      (h.area === "Salud" || h.energia === "Baja")
  );
  recomendacion.push({
    id: "rec-bienestar",
    tipo: "accion_bienestar",
    texto: habitoBienestarPendiente
      ? `Tomate un momento para "${habitoBienestarPendiente.nombre}" — todavía no lo marcaste hoy.`
      : "Tu bienestar está en orden hoy. Mantené el ritmo.",
  });

  return { observacion, comprension, interpretacion, prediccion, recomendacion };
}
