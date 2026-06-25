"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { useAccionStore } from "@/stores/accion-store";
import { useFinanzasStore } from "@/stores/finanzas-store";
import { calcularProgresoProyecto, formatFechaCorta } from "@/lib/accion-format";
import { VALOR_HORA_USD } from "@/lib/finanzas";

export default function ProyectosNegocioPage() {
  const proyectos = useAccionStore((s) => s.proyectos);
  const tareas = useAccionStore((s) => s.tareas);
  const ingresos = useFinanzasStore((s) => s.ingresos);

  const proyectosNegocio = proyectos.filter((p) => p.area === "Negocio");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-8 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Proyectos de Negocio</h1>
        <p className="text-sm text-text-secondary">
          {proyectosNegocio.length} proyectos
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {proyectosNegocio.map((p) => {
          const tareasProyecto = tareas.filter((t) => t.proyectoId === p.id);
          const progreso = calcularProgresoProyecto(p.id, tareas);
          const tiempoInvertidoMin = tareasProyecto.reduce((acc, t) => acc + t.tiempoRealMin, 0);
          const costoTiempo = (tiempoInvertidoMin / 60) * VALOR_HORA_USD;
          const ingresosGenerados = ingresos
            .filter((i) => i.proyectoId === p.id && i.estado !== "Pendiente")
            .reduce((acc, i) => acc + i.monto, 0);
          const rentabilidad = Math.round(ingresosGenerados - costoTiempo);

          return (
            <Link
              key={p.id}
              href={`/negocio/proyectos/${p.id}`}
              className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-medium text-foreground">{p.nombre}</span>
                  <span className="text-xs text-text-muted">
                    {p.cliente ?? "Sin cliente"}
                    {p.fechaLimite && ` · Vence ${formatFechaCorta(p.fechaLimite)}`}
                  </span>
                </div>
                <ArrowUpRight className="size-4 text-text-muted transition-colors group-hover:text-primary" />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progreso}%` }}
                  />
                </div>
                <span className="text-sm text-text-secondary">{progreso}%</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <span>Ingresos: ${ingresosGenerados.toLocaleString("es-AR")}</span>
                <span
                  className={rentabilidad >= 0 ? "text-success" : "text-destructive"}
                >
                  Rentabilidad: ${rentabilidad.toLocaleString("es-AR")}
                </span>
              </div>
            </Link>
          );
        })}

        {proyectosNegocio.length === 0 && (
          <p className="text-sm text-text-muted">No hay proyectos de negocio todavía.</p>
        )}
      </div>
    </div>
  );
}
