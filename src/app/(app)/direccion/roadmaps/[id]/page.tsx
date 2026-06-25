"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, CircleDot } from "lucide-react";

import { roadmaps } from "@/lib/mock/direccion";
import { useAccionStore } from "@/stores/accion-store";

const ESTADO_ICONO = {
  completada: <CheckCircle2 className="size-4 text-success" />,
  en_curso: <CircleDot className="size-4 text-primary" />,
  pendiente: <Circle className="size-4 text-text-muted" />,
};

export default function RoadmapDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const proyectos = useAccionStore((s) => s.proyectos);
  const tareas = useAccionStore((s) => s.tareas);

  const roadmap = roadmaps.find((r) => r.id === params.id);
  if (!roadmap) {
    return <div className="px-4 py-6 sm:px-8 sm:py-10 text-sm text-text-secondary">Roadmap no encontrado.</div>;
  }

  const proyecto = proyectos.find((p) => p.id === roadmap.proyectoId);

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <button
        onClick={() => router.push("/direccion/roadmaps")}
        className="flex w-fit items-center gap-1.5 text-sm text-text-secondary hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Roadmaps
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{roadmap.nombre}</h1>
        {proyecto && (
          <Link
            href={proyecto.area === "Negocio" ? `/negocio/proyectos/${proyecto.id}` : `/accion/proyectos/${proyecto.id}`}
            className="text-xs text-primary hover:underline"
          >
            Ver tareas del proyecto
          </Link>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {roadmap.fases.map((fase) => (
          <div
            key={fase.id}
            className={`flex w-72 shrink-0 flex-col gap-3 rounded-lg border p-4 ${
              fase.estado === "en_curso" ? "border-primary/50 bg-primary/5" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center gap-2">
              {ESTADO_ICONO[fase.estado]}
              <span className="text-sm font-medium text-foreground">{fase.nombre}</span>
            </div>
            <span className="text-xs text-text-muted">
              {fase.inicioEstimado} → {fase.finEstimado} ({fase.duracionDias}d)
            </span>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Real {fase.progresoReal}%</span>
                <span>Plan {fase.progresoPlanificado}%</span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="absolute h-full rounded-full bg-primary" style={{ width: `${fase.progresoReal}%` }} />
                <div
                  className="absolute h-full w-0.5 bg-foreground/60"
                  style={{ left: `${fase.progresoPlanificado}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {fase.hitos.map((h) => (
                <div key={h.titulo} className="flex items-start gap-1.5 text-xs">
                  {h.cumplido ? (
                    <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-success" />
                  ) : (
                    <Circle className="mt-0.5 size-3 shrink-0 text-text-muted" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-foreground">{h.titulo}</span>
                    <span className="text-text-muted">{h.fecha} · {h.criterioExito}</span>
                  </div>
                </div>
              ))}
            </div>

            {fase.recursos.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {fase.recursos.map((r) => (
                  <span key={r} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
          Tareas activas del proyecto
        </span>
        {tareas
          .filter((t) => t.proyectoId === roadmap.proyectoId && t.estado !== "completado")
          .map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-sm">
              <span className="text-foreground">{t.titulo}</span>
              <span className="text-text-muted">{t.estado.replace("_", " ")}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
