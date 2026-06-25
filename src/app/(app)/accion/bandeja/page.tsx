"use client";

import { useState } from "react";
import { Trash2, Inbox, ChevronRight, ChevronLeft, Check } from "lucide-react";

import type { Energia, Impacto, Prioridad, Tarea } from "@/types/accion";
import { useAccionStore } from "@/stores/accion-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PASOS = ["Clarificar", "Priorizar", "Asignar"] as const;

function ProcesarItem({
  item,
  proyectos,
  onCancelar,
  onConfirmar,
  onEliminar,
}: {
  item: Tarea;
  proyectos: { id: string; nombre: string }[];
  onCancelar: () => void;
  onConfirmar: (cambios: Partial<Tarea>) => void;
  onEliminar: () => void;
}) {
  const [paso, setPaso] = useState(0);
  const [titulo, setTitulo] = useState(item.titulo);
  const [prioridad, setPrioridad] = useState<Prioridad>("Media");
  const [impacto, setImpacto] = useState<Impacto>("Medio");
  const [energia, setEnergia] = useState<Energia>("Media");
  const [proyectoId, setProyectoId] = useState<string>("");

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-primary/30 bg-card p-5">
      <div className="flex items-center gap-2">
        {PASOS.map((p, i) => (
          <div key={p} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full text-xs font-medium",
                i < paso && "bg-success/20 text-success",
                i === paso && "bg-primary text-primary-foreground",
                i > paso && "bg-secondary text-text-muted"
              )}
            >
              {i < paso ? <Check className="size-3" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-sm",
                i === paso ? "text-foreground font-medium" : "text-text-muted"
              )}
            >
              {p}
            </span>
            {i < PASOS.length - 1 && (
              <ChevronRight className="size-3.5 text-text-muted" />
            )}
          </div>
        ))}
      </div>

      {paso === 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
            ¿Qué es esto exactamente?
          </label>
          <textarea
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="min-h-20 resize-none rounded-md border border-border bg-popover p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      )}

      {paso === 1 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
              Prioridad
            </label>
            <select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as Prioridad)}
              className="h-8 rounded-md border border-border bg-popover px-2 text-sm text-foreground"
            >
              {["Crítica", "Alta", "Media", "Baja"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
              Impacto
            </label>
            <select
              value={impacto}
              onChange={(e) => setImpacto(e.target.value as Impacto)}
              className="h-8 rounded-md border border-border bg-popover px-2 text-sm text-foreground"
            >
              {["Alto", "Medio", "Bajo"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
              Energía requerida
            </label>
            <select
              value={energia}
              onChange={(e) => setEnergia(e.target.value as Energia)}
              className="h-8 rounded-md border border-border bg-popover px-2 text-sm text-foreground"
            >
              {["Alta", "Media", "Baja"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Asignar a proyecto (opcional)
          </label>
          <select
            value={proyectoId}
            onChange={(e) => setProyectoId(e.target.value)}
            className="h-8 w-64 rounded-md border border-border bg-popover px-2 text-sm text-foreground"
          >
            <option value="">Sin proyecto</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-3">
        <Button variant="ghost" size="sm" className="text-destructive" onClick={onEliminar}>
          <Trash2 data-icon="inline-start" />
          Eliminar
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancelar}>
            Cancelar
          </Button>
          {paso > 0 && (
            <Button variant="secondary" size="sm" onClick={() => setPaso((p) => p - 1)}>
              <ChevronLeft data-icon="inline-start" />
              Atrás
            </Button>
          )}
          {paso < PASOS.length - 1 ? (
            <Button size="sm" onClick={() => setPaso((p) => p + 1)}>
              Siguiente
              <ChevronRight data-icon="inline-end" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() =>
                onConfirmar({
                  titulo,
                  prioridad,
                  impacto,
                  energia,
                  proyectoId: proyectoId || null,
                  bandeja: false,
                  estado: "sin_empezar",
                })
              }
            >
              Confirmar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BandejaPage() {
  const tareas = useAccionStore((s) => s.tareas);
  const proyectos = useAccionStore((s) => s.proyectos);
  const eliminarTarea = useAccionStore((s) => s.eliminarTarea);
  const actualizarTarea = useAccionStore((s) => s.actualizarTarea);
  const items = tareas.filter((t) => t.bandeja);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  function eliminar(id: string) {
    eliminarTarea(id);
    setProcesandoId(null);
  }

  function confirmar(id: string, cambios: Partial<Tarea>) {
    actualizarTarea(id, cambios);
    setProcesandoId(null);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Bandeja</h1>
        <p className="text-sm text-text-secondary">
          {items.length} elementos sin clasificar
        </p>
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <Inbox className="size-6 text-text-muted" />
          <span className="text-sm text-text-secondary">
            Tu bandeja está vacía. Buen trabajo.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {items.map((item) =>
          procesandoId === item.id ? (
            <ProcesarItem
              key={item.id}
              item={item}
              proyectos={proyectos}
              onCancelar={() => setProcesandoId(null)}
              onConfirmar={(cambios) => confirmar(item.id, cambios)}
              onEliminar={() => eliminar(item.id)}
            />
          ) : (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <Inbox className="size-4 shrink-0 text-text-muted" />
              <span className="flex-1 text-sm text-foreground">{item.titulo}</span>
              <Button variant="ghost" size="icon-sm" onClick={() => eliminar(item.id)}>
                <Trash2 className="size-3.5" />
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setProcesandoId(item.id)}>
                Procesar
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
