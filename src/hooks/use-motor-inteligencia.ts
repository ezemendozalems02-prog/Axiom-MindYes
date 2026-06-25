import { useMemo } from "react";

import { useAccionStore } from "@/stores/accion-store";
import { useIdentidadStore } from "@/stores/identidad-store";
import { useMenteStore } from "@/stores/mente-store";
import { useFinanzasStore } from "@/stores/finanzas-store";
import { useAreasDeVidaConectadas } from "@/hooks/use-areas-de-vida";
import { calcularIndices } from "@/lib/inteligencia/indices";
import { generarNivelesMotor } from "@/lib/inteligencia/motor";
import { getHoyISO } from "@/lib/hoy";

export function useMotorInteligencia() {
  const tareas = useAccionStore((s) => s.tareas);
  const proyectos = useAccionStore((s) => s.proyectos);

  const habitos = useIdentidadStore((s) => s.habitos);
  const estadoHoyHabitos = useIdentidadStore((s) => s.estadoHoy);
  const indiceConsistencia = useIdentidadStore((s) => s.indiceConsistenciaGlobal());

  const bandejaMental = useMenteStore((s) => s.bandeja);
  const decisiones = useMenteStore((s) => s.decisiones);

  const ingresos = useFinanzasStore((s) => s.ingresos);
  const gastos = useFinanzasStore((s) => s.gastos);
  const deudas = useFinanzasStore((s) => s.deudas);
  const objetivos = useFinanzasStore((s) => s.objetivos);

  const areasDeVida = useAreasDeVidaConectadas();

  const hoy = getHoyISO();

  const decisionesAbiertas = decisiones.filter(
    (d) => d.estado === "Abierta" || d.estado === "En análisis"
  ).length;
  const urgenciasSinFecha = tareas.filter(
    (t) => t.urgencia === "Alta" && !t.fechaLimite && !t.bandeja
  ).length;

  const indices = useMemo(
    () =>
      calcularIndices({
        pendientesBandejaMental: bandejaMental.length,
        decisionesAbiertas,
        urgenciasSinFecha,
        tareas,
        consistenciaHabitos: indiceConsistencia,
        areasDeVida,
      }),
    [bandejaMental.length, decisionesAbiertas, urgenciasSinFecha, tareas, indiceConsistencia, areasDeVida]
  );

  const niveles = useMemo(
    () =>
      generarNivelesMotor({
        tareas,
        proyectos,
        habitos,
        estadoHoyHabitos,
        bandejaMental,
        decisiones,
        ingresos,
        gastos,
        deudas,
        objetivos,
        indices,
        hoy,
      }),
    [tareas, proyectos, habitos, estadoHoyHabitos, bandejaMental, decisiones, ingresos, gastos, deudas, objetivos, indices, hoy]
  );

  return {
    indices,
    niveles,
    datos: { tareas, proyectos, habitos, estadoHoyHabitos, areasDeVida, ingresos, gastos, deudas, hoy },
  };
}
