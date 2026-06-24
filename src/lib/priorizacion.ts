import type { Energia, Tarea } from "@/types/accion";

const PESO_PRIORIDAD: Record<Tarea["prioridad"], number> = {
  Crítica: 40,
  Alta: 28,
  Media: 16,
  Baja: 6,
};

const PESO_IMPACTO: Record<Tarea["impacto"], number> = {
  Alto: 20,
  Medio: 10,
  Bajo: 3,
};

export function calcularScore(
  tarea: Tarea,
  todasLasTareas: Tarea[],
  energiaUsuario: Energia,
  hoy: string
): number {
  let score = PESO_PRIORIDAD[tarea.prioridad] + PESO_IMPACTO[tarea.impacto];

  if (tarea.urgencia === "Alta") score += 12;

  if (tarea.fechaLimite) {
    if (tarea.fechaLimite <= hoy) score += 18;
    else if (tarea.fechaLimite === hoy) score += 12;
  }

  const dependenciasPendientes = tarea.dependenciasIds.some((id) => {
    const dep = todasLasTareas.find((t) => t.id === id);
    return dep && dep.estado !== "completado";
  });
  if (dependenciasPendientes) score -= 30;

  if (tarea.energia === energiaUsuario) score += 6;
  else if (tarea.energia === "Alta" && energiaUsuario === "Baja") score -= 8;

  return score;
}

export function ordenarPorPrioridad(
  tareas: Tarea[],
  energiaUsuario: Energia,
  hoy: string
): Tarea[] {
  return [...tareas].sort(
    (a, b) =>
      calcularScore(b, tareas, energiaUsuario, hoy) -
      calcularScore(a, tareas, energiaUsuario, hoy)
  );
}
