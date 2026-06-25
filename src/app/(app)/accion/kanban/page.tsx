"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import type { EstadoTarea } from "@/types/accion";
import { COLUMNAS_KANBAN } from "@/types/accion";
import { useAccionStore } from "@/stores/accion-store";
import { useDireccionStore } from "@/stores/direccion-store";
import { TareaCardKanban } from "@/components/accion/tarea-card-kanban";
import { FormDialog } from "@/components/ui/form-dialog";
import { camposTarea, valoresATarea } from "@/components/accion/campos-tarea";
import { getHoyISO } from "@/lib/hoy";
import { cn } from "@/lib/utils";

export default function KanbanPage() {
  const todasLasTareas = useAccionStore((s) => s.tareas);
  const proyectos = useAccionStore((s) => s.proyectos);
  const objetivos = useDireccionStore((s) => s.objetivos);
  const moverEstadoStore = useAccionStore((s) => s.moverEstado);
  const agregarTarea = useAccionStore((s) => s.agregarTarea);
  const tareas = useMemo(() => todasLasTareas.filter((t) => !t.bandeja), [todasLasTareas]);
  const AREAS = useMemo(() => Array.from(new Set(tareas.map((t) => t.area))), [tareas]);
  const [arrastrandoId, setArrastrandoId] = useState<string | null>(null);
  const [filtroArea, setFiltroArea] = useState<string>("");
  const [filtroProyecto, setFiltroProyecto] = useState<string>("");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("");
  const [filtroEnergia, setFiltroEnergia] = useState<string>("");
  const [columnaNueva, setColumnaNueva] = useState<EstadoTarea | null>(null);

  const proyectoPorId = useMemo(
    () => Object.fromEntries(proyectos.map((p) => [p.id, p.nombre])),
    [proyectos]
  );

  const CAMPOS = useMemo(
    () =>
      camposTarea(
        proyectos.map((p) => ({ value: p.id, label: p.nombre })),
        objetivos.map((o) => ({ value: o.id, label: o.titulo }))
      ),
    [proyectos, objetivos]
  );

  const filtradas = tareas.filter(
    (t) =>
      (!filtroArea || t.area === filtroArea) &&
      (!filtroProyecto || t.proyectoId === filtroProyecto) &&
      (!filtroPrioridad || t.prioridad === filtroPrioridad) &&
      (!filtroEnergia || t.energia === filtroEnergia)
  );

  function moverEstado(id: string, estado: EstadoTarea) {
    moverEstadoStore(id, estado);
  }

  function guardarNuevaTarea(valores: Record<string, unknown>) {
    if (!columnaNueva) return;
    agregarTarea({
      id: crypto.randomUUID(),
      ...valoresATarea(valores),
      estado: columnaNueva,
      tiempoRealMin: 0,
      dependenciasIds: [],
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: getHoyISO(),
    });
  }

  return (
    <div className="flex h-full flex-col gap-5 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-foreground">Kanban</h1>

        <div className="ml-auto flex items-center gap-2">
          <select
            value={filtroArea}
            onChange={(e) => setFiltroArea(e.target.value)}
            className="h-8 rounded-md border border-border bg-popover px-2 text-xs text-foreground"
          >
            <option value="">Todas las áreas</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={filtroProyecto}
            onChange={(e) => setFiltroProyecto(e.target.value)}
            className="h-8 rounded-md border border-border bg-popover px-2 text-xs text-foreground"
          >
            <option value="">Todos los proyectos</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            className="h-8 rounded-md border border-border bg-popover px-2 text-xs text-foreground"
          >
            <option value="">Toda prioridad</option>
            {["Crítica", "Alta", "Media", "Baja"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select
            value={filtroEnergia}
            onChange={(e) => setFiltroEnergia(e.target.value)}
            className="h-8 rounded-md border border-border bg-popover px-2 text-xs text-foreground"
          >
            <option value="">Toda energía</option>
            {["Alta", "Media", "Baja"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto overflow-y-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-x-visible">
        {COLUMNAS_KANBAN.map((col) => {
          const itemsCol = filtradas.filter((t) => t.estado === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (arrastrandoId) moverEstado(arrastrandoId, col.id);
                setArrastrandoId(null);
              }}
              className={cn(
                "flex w-[78vw] shrink-0 flex-col gap-3 rounded-lg border border-border bg-popover/40 p-3 sm:w-auto sm:shrink"
              )}
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-medium text-foreground">
                  {col.titulo}
                </span>
                <span className="text-xs text-text-muted">{itemsCol.length}</span>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {itemsCol.map((tarea) => (
                  <TareaCardKanban
                    key={tarea.id}
                    tarea={tarea}
                    proyectoNombre={
                      tarea.proyectoId ? proyectoPorId[tarea.proyectoId] : undefined
                    }
                    dragging={arrastrandoId === tarea.id}
                    onDragStart={() => setArrastrandoId(tarea.id)}
                  />
                ))}
              </div>

              <button
                onClick={() => setColumnaNueva(col.id)}
                className="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-1.5 text-xs text-text-secondary hover:border-primary/40 hover:text-foreground"
              >
                <Plus className="size-3.5" />
                Nueva tarea
              </button>
            </div>
          );
        })}
      </div>

      <FormDialog
        open={columnaNueva !== null}
        onOpenChange={(v) => !v && setColumnaNueva(null)}
        title={`Nueva tarea — ${columnaNueva ? COLUMNAS_KANBAN.find((c) => c.id === columnaNueva)?.titulo : ""}`}
        campos={CAMPOS}
        datosIniciales={{ area: filtroArea, prioridad: "Media", impacto: "Medio", urgencia: "Normal", energia: "Media" }}
        onGuardar={guardarNuevaTarea}
        submitLabel="Crear tarea"
      />
    </div>
  );
}
