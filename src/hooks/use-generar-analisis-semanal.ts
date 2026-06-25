import { useMotorInteligencia } from "@/hooks/use-motor-inteligencia";
import { useInteligenciaStore } from "@/stores/inteligencia-store";
import { useFinanzasStore } from "@/stores/finanzas-store";
import { generarAnalisisSemanal } from "@/lib/inteligencia/analisis-semanal";
import { getInicioSemana, toISO } from "@/lib/calendario";
import type { AnalisisSemanal } from "@/types/inteligencia";

export function useGenerarAnalisisSemanal() {
  const { indices, niveles, datos } = useMotorInteligencia();
  const agregarAnalisisSemanal = useInteligenciaStore((s) => s.agregarAnalisisSemanal);
  const ingresos = useFinanzasStore((s) => s.ingresos);

  return function generar(): AnalisisSemanal {
    const inicioSemana = toISO(getInicioSemana(new Date(datos.hoy + "T00:00:00")));
    const tareasSemana = datos.tareas.filter(
      (t) =>
        t.fechaProgramada &&
        t.fechaProgramada >= inicioSemana &&
        t.fechaProgramada <= datos.hoy &&
        !t.bandeja
    );
    const ingresosSemana = ingresos
      .filter((i) => i.fecha >= inicioSemana && i.fecha <= datos.hoy && i.estado !== "Pendiente")
      .reduce((acc, i) => acc + i.monto, 0);

    const analisis = generarAnalisisSemanal({
      hoy: datos.hoy,
      indices,
      niveles,
      habitos: datos.habitos,
      estadoHoyHabitos: datos.estadoHoyHabitos,
      areasDeVida: datos.areasDeVida,
      tareasCompletadasSemana: tareasSemana.filter((t) => t.estado === "completado").length,
      tareasTotalesSemana: tareasSemana.length,
      ingresosSemana,
    });
    agregarAnalisisSemanal(analisis);
    return analisis;
  };
}
