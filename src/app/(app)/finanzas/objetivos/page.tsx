"use client";

import { useFinanzasStore } from "@/stores/finanzas-store";
import { getHoyISO } from "@/lib/hoy";
import { mesDe, sumarGastosDelMes, sumarIngresosDelMes } from "@/lib/finanzas";

function BarraObjetivo({
  label,
  actual,
  objetivo,
}: {
  label: string;
  actual: number;
  objetivo: number;
}) {
  const pct = objetivo > 0 ? Math.min(100, Math.round((actual / objetivo) * 100)) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="text-text-secondary">
          ${actual.toLocaleString("es-AR")} / ${objetivo.toLocaleString("es-AR")}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ObjetivosFinancierosPage() {
  const objetivos = useFinanzasStore((s) => s.objetivos);
  const ingresos = useFinanzasStore((s) => s.ingresos);
  const gastos = useFinanzasStore((s) => s.gastos);

  const mesActual = mesDe(getHoyISO());
  const ingresosMes = sumarIngresosDelMes(ingresos, mesActual);
  const gastosMes = sumarGastosDelMes(gastos, mesActual);
  const ahorroMes = Math.max(0, ingresosMes - gastosMes);

  const totalInversiones = objetivos.inversiones.reduce((acc, i) => acc + i.monto, 0);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-8 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Objetivos Financieros</h1>
        <p className="text-sm text-text-secondary">
          Tu rumbo económico, no solo tu balance.
        </p>
      </div>

      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5">
        <BarraObjetivo
          label="Ingreso mensual"
          actual={ingresosMes}
          objetivo={objetivos.ingresoMensualTarget}
        />
        <BarraObjetivo
          label="Ahorro mensual"
          actual={ahorroMes}
          objetivo={objetivos.ahorroMensualTarget}
        />
        <BarraObjetivo
          label="Fondo de emergencia"
          actual={objetivos.fondoEmergenciaActual}
          objetivo={objetivos.fondoEmergenciaTarget}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Inversiones
        </span>
        {objetivos.inversiones.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between text-sm">
            <span className="text-foreground">{inv.nombre}</span>
            <span className="text-text-secondary">${inv.monto.toLocaleString("es-AR")}</span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-border pt-2 text-sm font-medium">
          <span className="text-foreground">Total invertido</span>
          <span className="text-foreground">${totalInversiones.toLocaleString("es-AR")}</span>
        </div>
      </div>
    </div>
  );
}
