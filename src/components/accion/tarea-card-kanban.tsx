"use client";

import type { Tarea } from "@/types/accion";
import { Badge } from "@/components/ui/badge";
import { PRIORIDAD_COLOR, formatMinutos } from "@/lib/accion-format";
import { cn } from "@/lib/utils";

export function TareaCardKanban({
  tarea,
  proyectoNombre,
  onDragStart,
  dragging,
}: {
  tarea: Tarea;
  proyectoNombre?: string;
  onDragStart: () => void;
  dragging?: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        "flex cursor-grab flex-col gap-2 rounded-md border border-border bg-card p-3 transition-opacity active:cursor-grabbing",
        dragging && "opacity-40"
      )}
    >
      <span className="text-sm font-medium text-foreground">{tarea.titulo}</span>
      <span className="text-xs text-text-muted">
        {proyectoNombre ?? tarea.area}
      </span>
      <div className="flex items-center justify-between">
        <Badge className={PRIORIDAD_COLOR[tarea.prioridad]}>{tarea.prioridad}</Badge>
        <span className="text-xs text-text-secondary">
          {formatMinutos(tarea.tiempoEstimadoMin)}
        </span>
      </div>
    </div>
  );
}
