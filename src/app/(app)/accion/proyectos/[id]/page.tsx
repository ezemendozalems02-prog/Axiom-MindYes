"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText, History, NotebookText, BarChart3 } from "lucide-react";
import Link from "next/link";

import { useAccionStore } from "@/stores/accion-store";
import { TareaRow } from "@/components/accion/tarea-row";
import { formatFechaCorta, formatMinutos } from "@/lib/accion-format";

const TABS = ["Tareas", "Notas", "Archivos", "Cronología", "Métricas"] as const;

export default function ProyectoDetallePage() {
  const params = useParams<{ id: string }>();
  const proyectos = useAccionStore((s) => s.proyectos);
  const todasLasTareas = useAccionStore((s) => s.tareas);
  const toggleCompletada = useAccionStore((s) => s.toggleCompletada);
  const proyecto = proyectos.find((p) => p.id === params.id);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Tareas");
  const tareas = todasLasTareas.filter((t) => t.proyectoId === params.id);

  if (!proyecto) {
    return (
      <div className="px-8 py-10 text-sm text-text-secondary">
        Proyecto no encontrado.
      </div>
    );
  }

  const completadas = tareas.filter((t) => t.estado === "completado").length;
  const tiempoInvertido = tareas.reduce((acc, t) => acc + t.tiempoRealMin, 0);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-8 py-10">
      <Link
        href="/accion/proyectos"
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Proyectos
      </Link>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">{proyecto.nombre}</h1>
          <span className="text-sm text-text-secondary">{proyecto.progreso}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${proyecto.progreso}%` }}
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span>{proyecto.area}</span>
          {proyecto.cliente && (
            <>
              <span className="text-text-muted">·</span>
              <span>{proyecto.cliente}</span>
            </>
          )}
          {proyecto.fechaLimite && (
            <>
              <span className="text-text-muted">·</span>
              <span>Vence {formatFechaCorta(proyecto.fechaLimite)}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-3 py-2 text-sm font-medium transition-colors ${
              tab === t ? "text-foreground" : "text-text-secondary hover:text-foreground"
            }`}
          >
            {t}
            {tab === t && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {tab === "Tareas" && (
        <div className="flex flex-col gap-2">
          {tareas.length === 0 && (
            <p className="text-sm text-text-muted">Sin tareas todavía.</p>
          )}
          {tareas.map((t) => (
            <TareaRow
              key={t.id}
              tarea={t}
              onToggleCompletada={toggleCompletada}
              onIniciar={() => {}}
            />
          ))}
        </div>
      )}

      {tab === "Notas" && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <NotebookText className="size-5 text-text-muted" />
          <span className="text-sm text-text-secondary">
            Todavía no hay notas en este proyecto.
          </span>
        </div>
      )}

      {tab === "Archivos" && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <FileText className="size-5 text-text-muted" />
          <span className="text-sm text-text-secondary">
            Todavía no hay archivos adjuntos.
          </span>
        </div>
      )}

      {tab === "Cronología" && (
        <div className="flex flex-col gap-3">
          {tareas
            .filter((t) => t.estado === "completado")
            .map((t) => (
              <div key={t.id} className="flex items-center gap-3 text-sm">
                <History className="size-3.5 text-text-muted" />
                <span className="text-foreground">{t.titulo}</span>
                <span className="text-text-muted">completada</span>
              </div>
            ))}
          {tareas.filter((t) => t.estado === "completado").length === 0 && (
            <p className="text-sm text-text-muted">Sin actividad registrada todavía.</p>
          )}
        </div>
      )}

      {tab === "Métricas" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-text-muted uppercase tracking-wide">
              Tareas completadas
            </span>
            <span className="text-2xl font-semibold text-foreground">
              {completadas}/{tareas.length}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-text-muted uppercase tracking-wide">
              Tiempo invertido
            </span>
            <span className="text-2xl font-semibold text-foreground">
              {formatMinutos(tiempoInvertido)}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-text-muted uppercase tracking-wide">
              Avance
            </span>
            <span className="text-2xl font-semibold text-foreground">
              <BarChart3 className="mr-1 inline size-4 text-primary" />
              {proyecto.progreso}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
