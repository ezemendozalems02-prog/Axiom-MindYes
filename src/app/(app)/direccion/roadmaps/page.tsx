"use client";

import Link from "next/link";

import { roadmaps } from "@/lib/mock/direccion";
import { useAccionStore } from "@/stores/accion-store";

export default function RoadmapsPage() {
  const proyectos = useAccionStore((s) => s.proyectos);

  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-8 sm:py-8">
      <h1 className="text-lg font-semibold text-foreground">Roadmaps de proyectos estratégicos</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {roadmaps.map((r) => {
          const proyecto = proyectos.find((p) => p.id === r.proyectoId);
          const completadas = r.fases.filter((f) => f.estado === "completada").length;
          return (
            <Link
              key={r.id}
              href={`/direccion/roadmaps/${r.id}`}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5 hover:border-primary/40"
            >
              <span className="text-sm font-medium text-foreground">{r.nombre}</span>
              <span className="text-xs text-text-muted">{proyecto?.nombre}</span>
              <span className="text-xs text-text-secondary">
                {completadas} de {r.fases.length} fases completadas
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
