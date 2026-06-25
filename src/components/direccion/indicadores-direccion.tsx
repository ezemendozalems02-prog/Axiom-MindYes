"use client";

import { useDireccionStore } from "@/stores/direccion-store";
import { useAccionStore } from "@/stores/accion-store";
import { calcularAlineacion, calcularBrechaVisionAccion, calcularIndiceDireccion } from "@/lib/direccion";

function consistenciaEstrategica(planes: { completado: boolean }[]): number {
  let racha = 0;
  for (const p of planes) {
    if (!p.completado) break;
    racha++;
  }
  return racha;
}

export function IndicadoresDireccion() {
  const objetivos = useDireccionStore((s) => s.objetivos);
  const planesSemanales = useDireccionStore((s) => s.planesSemanales);
  const tareas = useAccionStore((s) => s.tareas);

  const indiceDireccion = calcularIndiceDireccion(objetivos, tareas);
  const alineacion = calcularAlineacion(objetivos, tareas);
  const consistencia = consistenciaEstrategica(planesSemanales);
  const brechas = calcularBrechaVisionAccion(objetivos, tareas);
  const brechaMayor = brechas[0];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Índice de Dirección" valor={`${indiceDireccion}%`} detalle="objetivos activos con avance en 7 días" />
      <Stat label="Alineación" valor={`${alineacion}%`} detalle="tareas rastreables a un objetivo" />
      <Stat label="Consistencia estratégica" valor={`${consistencia}`} detalle="semanas seguidas con Plan Semanal" />
      <Stat
        label="Brecha Visión-Acción"
        valor={brechaMayor ? `${brechaMayor.brecha}pp` : "—"}
        detalle={brechaMayor ? `${brechaMayor.area}: dices que importa, pero no es donde va tu tiempo` : "sin datos suficientes"}
        alerta={brechaMayor ? brechaMayor.brecha >= 30 : false}
      />
    </div>
  );
}

function Stat({
  label,
  valor,
  detalle,
  alerta = false,
}: {
  label: string;
  valor: string;
  detalle: string;
  alerta?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1 rounded-lg border p-4 ${alerta ? "border-warning/40 bg-warning/5" : "border-border bg-card"}`}>
      <span className="text-xs uppercase tracking-wide text-text-muted">{label}</span>
      <span className="text-xl font-semibold text-foreground">{valor}</span>
      <span className="text-xs text-text-secondary">{detalle}</span>
    </div>
  );
}
