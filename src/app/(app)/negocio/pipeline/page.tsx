"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { COLUMNAS_PIPELINE } from "@/types/negocio";
import { useNegocioStore } from "@/stores/negocio-store";
import { cn } from "@/lib/utils";
import { getHoyISO } from "@/lib/hoy";
import { Button } from "@/components/ui/button";
import { FormDialog, type CampoForm } from "@/components/ui/form-dialog";

export default function PipelinePage() {
  const oportunidades = useNegocioStore((s) => s.oportunidades);
  const clientes = useNegocioStore((s) => s.clientes);
  const moverOportunidad = useNegocioStore((s) => s.moverOportunidad);
  const agregarOportunidad = useNegocioStore((s) => s.agregarOportunidad);
  const [arrastrandoId, setArrastrandoId] = useState<string | null>(null);
  const [dialogAbierto, setDialogAbierto] = useState(false);

  const clientePorId = useMemo(
    () => Object.fromEntries(clientes.map((c) => [c.id, c.nombre])),
    [clientes]
  );

  const CAMPOS: CampoForm[] = [
    { key: "titulo", label: "Título", type: "text", placeholder: "Ej: Mantenimiento mensual" },
    {
      key: "clienteId",
      label: "Cliente",
      type: "select-ref",
      opciones: clientes.map((c) => ({ value: c.id, label: c.nombre })),
      vacio: "Sin cliente",
    },
    { key: "valorEstimado", label: "Valor estimado (USD)", type: "number", placeholder: "1000" },
    { key: "probabilidad", label: "Probabilidad de cierre (%)", type: "number", placeholder: "50" },
    { key: "fechaEstimadaCierre", label: "Fecha estimada de cierre", type: "date" },
  ];

  function guardar(valores: Record<string, unknown>) {
    agregarOportunidad({
      id: crypto.randomUUID(),
      clienteId: String(valores.clienteId ?? ""),
      titulo: String(valores.titulo),
      valorEstimado: Number(valores.valorEstimado) || 0,
      probabilidad: Number(valores.probabilidad) || 0,
      fechaEstimadaCierre: (valores.fechaEstimadaCierre as string) || null,
      estado: "Nuevo Contacto",
      creadaEn: getHoyISO(),
      cerradaEn: null,
    });
  }

  const ganadas = oportunidades.filter((o) => o.estado === "Cerrado Ganado");
  const perdidas = oportunidades.filter((o) => o.estado === "Cerrado Perdido");
  const cerradas = ganadas.length + perdidas.length;
  const tasaConversion = cerradas > 0 ? Math.round((ganadas.length / cerradas) * 100) : 0;
  const valorPromedio =
    oportunidades.length > 0
      ? Math.round(
          oportunidades.reduce((acc, o) => acc + o.valorEstimado, 0) / oportunidades.length
        )
      : 0;
  const tiempoPromedioCierreDias =
    ganadas.length > 0
      ? Math.round(
          ganadas.reduce((acc, o) => {
            if (!o.cerradaEn) return acc;
            const dias =
              (new Date(o.cerradaEn).getTime() - new Date(o.creadaEn).getTime()) /
              (1000 * 60 * 60 * 24);
            return acc + dias;
          }, 0) / ganadas.length
        )
      : 0;

  return (
    <div className="flex h-full flex-col gap-5 px-8 py-8">
      <div className="flex flex-wrap items-center gap-6">
        <h1 className="text-2xl font-semibold text-foreground">Pipeline de Ventas</h1>

        <Button size="sm" onClick={() => setDialogAbierto(true)}>
          <Plus data-icon="inline-start" />
          Nueva Oportunidad
        </Button>

        <div className="ml-auto flex items-center gap-6 text-sm">
          <div className="flex flex-col">
            <span className="text-xs text-text-muted">Tasa de conversión</span>
            <span className="font-medium text-foreground">{tasaConversion}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-text-muted">Tiempo promedio de cierre</span>
            <span className="font-medium text-foreground">{tiempoPromedioCierreDias}d</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-text-muted">Valor promedio</span>
            <span className="font-medium text-foreground">
              ${valorPromedio.toLocaleString("es-AR")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-5 gap-4 overflow-y-auto">
        {COLUMNAS_PIPELINE.map((col) => {
          const itemsCol = oportunidades.filter((o) => o.estado === col.id);
          const totalCol = itemsCol.reduce((acc, o) => acc + o.valorEstimado, 0);

          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (arrastrandoId) moverOportunidad(arrastrandoId, col.id);
                setArrastrandoId(null);
              }}
              className="flex flex-col gap-3 rounded-lg border border-border bg-popover/40 p-3"
            >
              <div className="flex flex-col gap-0.5 px-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{col.titulo}</span>
                  <span className="text-xs text-text-muted">{itemsCol.length}</span>
                </div>
                <span className="text-xs text-text-secondary">
                  ${totalCol.toLocaleString("es-AR")}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {itemsCol.map((op) => (
                  <div
                    key={op.id}
                    draggable
                    onDragStart={() => setArrastrandoId(op.id)}
                    className={cn(
                      "flex cursor-grab flex-col gap-2 rounded-md border border-border bg-card p-3 active:cursor-grabbing",
                      arrastrandoId === op.id && "opacity-40"
                    )}
                  >
                    <span className="text-sm font-medium text-foreground">{op.titulo}</span>
                    <span className="text-xs text-text-muted">
                      {clientePorId[op.clienteId] ?? "—"}
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground">
                        ${op.valorEstimado.toLocaleString("es-AR")}
                      </span>
                      <span className="text-text-secondary">{op.probabilidad}%</span>
                    </div>
                    {op.fechaEstimadaCierre && (
                      <span className="text-xs text-text-muted">
                        Cierre: {op.fechaEstimadaCierre}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <FormDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        title="Nueva oportunidad"
        campos={CAMPOS}
        onGuardar={guardar}
        submitLabel="Crear oportunidad"
      />
    </div>
  );
}
