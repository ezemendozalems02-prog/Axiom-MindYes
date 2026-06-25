"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";

import { COLUMNAS_KANBAN } from "@/types/accion";
import { useAccionStore } from "@/stores/accion-store";
import { useNegocioStore } from "@/stores/negocio-store";
import { useFinanzasStore } from "@/stores/finanzas-store";
import { calcularProgresoProyecto, formatFechaCorta, formatMinutos } from "@/lib/accion-format";
import { VALOR_HORA_USD } from "@/lib/finanzas";
import { TareaCardKanban } from "@/components/accion/tarea-card-kanban";

const TABS = ["Resumen", "Tareas", "Cronología", "Rentabilidad"] as const;

export default function ProyectoNegocioDetallePage() {
  const params = useParams<{ id: string }>();
  const proyectos = useAccionStore((s) => s.proyectos);
  const todasLasTareas = useAccionStore((s) => s.tareas);
  const moverEstado = useAccionStore((s) => s.moverEstado);
  const clientes = useNegocioStore((s) => s.clientes);
  const ingresos = useFinanzasStore((s) => s.ingresos);

  const [tab, setTab] = useState<(typeof TABS)[number]>("Resumen");
  const [arrastrandoId, setArrastrandoId] = useState<string | null>(null);

  const proyecto = proyectos.find((p) => p.id === params.id);
  const tareas = todasLasTareas.filter((t) => t.proyectoId === params.id);
  const cliente = clientes.find((c) => c.id === proyecto?.clienteId);

  if (!proyecto) {
    return (
      <div className="px-8 py-10 text-sm text-text-secondary">Proyecto no encontrado.</div>
    );
  }

  const progreso = calcularProgresoProyecto(proyecto.id, todasLasTareas);
  const proximaTarea = tareas.find((t) => t.estado !== "completado");
  const tiempoInvertidoMin = tareas.reduce((acc, t) => acc + t.tiempoRealMin, 0);
  const costoTiempo = (tiempoInvertidoMin / 60) * VALOR_HORA_USD;
  const ingresosGenerados = ingresos
    .filter((i) => i.proyectoId === proyecto.id && i.estado !== "Pendiente")
    .reduce((acc, i) => acc + i.monto, 0);
  const rentabilidad = Math.round(ingresosGenerados - costoTiempo);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-8 py-10">
      <Link
        href="/negocio/proyectos"
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Proyectos de Negocio
      </Link>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">{proyecto.nombre}</h1>
          <span className="text-sm text-text-secondary">{progreso}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progreso}%` }} />
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

      {tab === "Resumen" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
              Resumen ejecutivo
            </span>
            <p className="mt-2 text-sm text-text-secondary">
              {proyecto.nombre} se encuentra en curso con un avance del {progreso}%.{" "}
              {proximaTarea
                ? `La próxima tarea es "${proximaTarea.titulo}".`
                : "No tiene tareas pendientes."}{" "}
              {proyecto.fechaLimite && `Vence el ${formatFechaCorta(proyecto.fechaLimite)}.`}
            </p>
          </div>

          {cliente && (
            <div className="rounded-lg border border-border bg-card p-5">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Cliente asociado
              </span>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{cliente.nombre}</span>
                  <span className="text-xs text-text-muted">
                    {cliente.empresa} · {cliente.sector}
                  </span>
                </div>
                <Link
                  href="/negocio/crm"
                  className="text-xs text-primary hover:underline"
                >
                  Ver en CRM
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "Tareas" && (
        <div className="grid grid-cols-4 gap-3">
          {COLUMNAS_KANBAN.map((col) => {
            const itemsCol = tareas.filter((t) => t.estado === col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (arrastrandoId) moverEstado(arrastrandoId, col.id);
                  setArrastrandoId(null);
                }}
                className="flex flex-col gap-2 rounded-lg border border-border bg-popover/40 p-3"
              >
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-medium text-foreground">{col.titulo}</span>
                  <span className="text-xs text-text-muted">{itemsCol.length}</span>
                </div>
                {itemsCol.map((t) => (
                  <TareaCardKanban
                    key={t.id}
                    tarea={t}
                    dragging={arrastrandoId === t.id}
                    onDragStart={() => setArrastrandoId(t.id)}
                  />
                ))}
              </div>
            );
          })}
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

      {tab === "Rentabilidad" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-text-muted uppercase tracking-wide">
              Ingresos generados
            </span>
            <span className="text-2xl font-semibold text-foreground">
              ${ingresosGenerados.toLocaleString("es-AR")}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-text-muted uppercase tracking-wide">
              Tiempo invertido
            </span>
            <span className="text-2xl font-semibold text-foreground">
              {formatMinutos(tiempoInvertidoMin)}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-text-muted uppercase tracking-wide">
              Costo del tiempo
            </span>
            <span className="text-2xl font-semibold text-foreground">
              ${Math.round(costoTiempo).toLocaleString("es-AR")}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-text-muted uppercase tracking-wide">
              Rentabilidad
            </span>
            <span
              className={`text-2xl font-semibold ${rentabilidad >= 0 ? "text-success" : "text-destructive"}`}
            >
              ${rentabilidad.toLocaleString("es-AR")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
