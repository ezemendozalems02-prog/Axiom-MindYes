import { Flame } from "lucide-react";

import type { Progreso as ProgresoType } from "@/types/centro-de-control";
import { cn } from "@/lib/utils";

function BarraProgreso({
  nombre,
  valor,
  colorClassName = "bg-primary",
}: {
  nombre: string;
  valor: number;
  colorClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground">{nombre}</span>
        <span className="text-text-secondary">{valor}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full", colorClassName)}
          style={{ width: `${valor}%` }}
        />
      </div>
    </div>
  );
}

export function Progreso({ progreso }: { progreso: ProgresoType }) {
  const pctIngresos = Math.min(
    100,
    Math.round((progreso.ingresos.actual / progreso.ingresos.objetivo) * 100)
  );

  return (
    <section className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5">
      <h3 className="text-xl font-medium text-foreground">Progreso</h3>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Objetivos activos
          </span>
          {progreso.objetivos.map((o) => (
            <BarraProgreso key={o.id} nombre={o.nombre} valor={o.progreso} />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Proyectos en curso
          </span>
          {progreso.proyectos.map((p) => (
            <BarraProgreso key={p.id} nombre={p.nombre} valor={p.progreso} />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 border-t border-border pt-4">
        <div className="flex items-center gap-3">
          {progreso.rachas.map((r) => (
            <span
              key={r.habito}
              className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground"
            >
              <Flame className="size-3.5 text-warning" />
              {r.habito} · {r.dias}d
            </span>
          ))}
        </div>

        <div className="ml-auto flex flex-col gap-1.5 min-w-48">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Ingresos del mes</span>
            <span className="text-foreground">
              ${progreso.ingresos.actual.toLocaleString("es-AR")} / $
              {progreso.ingresos.objetivo.toLocaleString("es-AR")}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-success"
              style={{ width: `${pctIngresos}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
