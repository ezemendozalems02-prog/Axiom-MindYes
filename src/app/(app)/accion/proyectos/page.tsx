"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { useAccionStore } from "@/stores/accion-store";
import { formatFechaCorta } from "@/lib/accion-format";

export default function ProyectosPage() {
  const proyectos = useAccionStore((s) => s.proyectos);
  const tareas = useAccionStore((s) => s.tareas);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-8 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Proyectos activos
        </h1>
        <p className="text-sm text-text-secondary">
          {proyectos.length} proyectos en curso
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {proyectos.map((p) => {
          const tareasProyecto = tareas.filter((t) => t.proyectoId === p.id);
          const proximaTarea = tareasProyecto.find((t) => t.estado !== "completado");
          const fechaLimite = formatFechaCorta(p.fechaLimite);

          return (
            <Link
              key={p.id}
              href={`/accion/proyectos/${p.id}`}
              className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-medium text-foreground">
                    {p.nombre}
                  </span>
                  <span className="text-xs text-text-muted">
                    {p.area}
                    {p.cliente && ` · ${p.cliente}`}
                  </span>
                </div>
                <ArrowUpRight className="size-4 text-text-muted transition-colors group-hover:text-primary" />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${p.progreso}%` }}
                  />
                </div>
                <span className="text-sm text-text-secondary">{p.progreso}%</span>
              </div>

              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>
                  Próxima: {proximaTarea ? proximaTarea.titulo : "Sin tareas pendientes"}
                </span>
                {fechaLimite && <span>Vence {fechaLimite}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
