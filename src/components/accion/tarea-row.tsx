"use client";

import { GripVertical, Play, Check } from "lucide-react";

import type { Tarea } from "@/types/accion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRIORIDAD_COLOR, formatMinutos } from "@/lib/accion-format";
import { cn } from "@/lib/utils";

export function TareaRow({
  tarea,
  proyectoNombre,
  draggable,
  onToggleCompletada,
  onIniciar,
  onDragStart,
  onDragOver,
  onDrop,
  dragging,
}: {
  tarea: Tarea;
  proyectoNombre?: string;
  draggable?: boolean;
  onToggleCompletada: (id: string) => void;
  onIniciar: (tarea: Tarea) => void;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  dragging?: boolean;
}) {
  const completada = tarea.estado === "completado";

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-opacity",
        dragging && "opacity-40"
      )}
    >
      {draggable && (
        <GripVertical className="size-4 shrink-0 cursor-grab text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
      )}

      <button
        onClick={() => onToggleCompletada(tarea.id)}
        aria-label="Completar tarea"
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border border-border transition-colors duration-150",
          completada && "border-success bg-success/20 text-success"
        )}
      >
        {completada && <Check className="size-3" />}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "truncate text-sm font-medium text-foreground transition-colors",
            completada && "text-text-muted line-through"
          )}
        >
          {tarea.titulo}
        </span>
        <span className="truncate text-xs text-text-muted">
          {proyectoNombre ? `${proyectoNombre} · ${tarea.area}` : tarea.area}
        </span>
      </div>

      <Badge className={cn("shrink-0", PRIORIDAD_COLOR[tarea.prioridad])}>
        {tarea.prioridad}
      </Badge>

      <span className="w-14 shrink-0 text-right text-xs text-text-secondary">
        {formatMinutos(tarea.tiempoEstimadoMin)}
      </span>

      {!completada && (
        <Button size="sm" variant="secondary" onClick={() => onIniciar(tarea)}>
          <Play data-icon="inline-start" />
          Iniciar
        </Button>
      )}
    </div>
  );
}
