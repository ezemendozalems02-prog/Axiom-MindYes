"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Pencil, Plus } from "lucide-react";

import { useAccionStore } from "@/stores/accion-store";
import { useFinanzasStore } from "@/stores/finanzas-store";
import { useNegocioStore } from "@/stores/negocio-store";
import { calcularProgresoProyecto, formatFechaCorta } from "@/lib/accion-format";
import { VALOR_HORA_USD } from "@/lib/finanzas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/ui/form-dialog";
import { camposProyecto, valoresAProyecto } from "@/components/accion/campos-proyecto";

export default function ProyectosNegocioPage() {
  const proyectos = useAccionStore((s) => s.proyectos);
  const tareas = useAccionStore((s) => s.tareas);
  const agregarProyecto = useAccionStore((s) => s.agregarProyecto);
  const actualizarProyecto = useAccionStore((s) => s.actualizarProyecto);
  const ingresos = useFinanzasStore((s) => s.ingresos);
  const clientes = useNegocioStore((s) => s.clientes);

  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [proyectoEditando, setProyectoEditando] = useState<string | null>(null);

  const proyectosNegocio = proyectos.filter((p) => p.area === "Negocio");

  const clientesOpciones = useMemo(
    () => clientes.map((c) => ({ value: c.id, label: c.nombre })),
    [clientes]
  );
  const clientePorId = useMemo(
    () => Object.fromEntries(clientes.map((c) => [c.id, c.nombre])),
    [clientes]
  );
  const CAMPOS = useMemo(() => camposProyecto(clientesOpciones), [clientesOpciones]);

  const proyectoActual = proyectos.find((p) => p.id === proyectoEditando);

  function guardarNuevo(valores: Record<string, unknown>) {
    agregarProyecto({
      id: crypto.randomUUID(),
      progreso: 0,
      ...valoresAProyecto(valores),
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Proyectos de Negocio</h1>
          <p className="text-sm text-text-secondary">
            {proyectosNegocio.length} proyectos
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogAbierto(true)}>
          <Plus data-icon="inline-start" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {proyectosNegocio.map((p) => {
          const tareasProyecto = tareas.filter((t) => t.proyectoId === p.id);
          const progreso = calcularProgresoProyecto(p.id, tareas);
          const tiempoInvertidoMin = tareasProyecto.reduce((acc, t) => acc + t.tiempoRealMin, 0);
          const costoTiempo = (tiempoInvertidoMin / 60) * VALOR_HORA_USD;
          const ingresosGenerados = ingresos
            .filter((i) => i.proyectoId === p.id && i.estado !== "Pendiente")
            .reduce((acc, i) => acc + i.monto, 0);
          const rentabilidad = Math.round(ingresosGenerados - costoTiempo);

          return (
            <div
              key={p.id}
              className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center justify-between">
                <Link href={`/negocio/proyectos/${p.id}`} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-foreground">{p.nombre}</span>
                    <Badge
                      className={
                        p.tipo === "Cliente"
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-text-secondary"
                      }
                    >
                      {p.tipo === "Cliente" && p.clienteId && clientePorId[p.clienteId]
                        ? clientePorId[p.clienteId]
                        : p.tipo}
                    </Badge>
                  </div>
                  <span className="text-xs text-text-muted">
                    {p.fechaLimite ? `Vence ${formatFechaCorta(p.fechaLimite)}` : "Sin fecha límite"}
                  </span>
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setProyectoEditando(p.id)}
                    className="text-text-muted hover:text-foreground"
                    aria-label="Editar proyecto"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <Link href={`/negocio/proyectos/${p.id}`}>
                    <ArrowUpRight className="size-4 text-text-muted transition-colors group-hover:text-primary" />
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progreso}%` }}
                  />
                </div>
                <span className="text-sm text-text-secondary">{progreso}%</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <span>Ingresos: ${ingresosGenerados.toLocaleString("es-AR")}</span>
                <span
                  className={rentabilidad >= 0 ? "text-success" : "text-destructive"}
                >
                  Rentabilidad: ${rentabilidad.toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          );
        })}

        {proyectosNegocio.length === 0 && (
          <p className="text-sm text-text-muted">No hay proyectos de negocio todavía.</p>
        )}
      </div>

      <FormDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        title="Nuevo proyecto de negocio"
        campos={CAMPOS}
        datosIniciales={{ area: "Negocio", tipo: "Cliente", estado: "en_curso" }}
        onGuardar={guardarNuevo}
        submitLabel="Crear proyecto"
      />

      <FormDialog
        open={proyectoEditando !== null}
        onOpenChange={(v) => !v && setProyectoEditando(null)}
        title="Editar proyecto"
        campos={CAMPOS}
        datosIniciales={proyectoActual}
        onGuardar={(valores) => proyectoActual && actualizarProyecto(proyectoActual.id, valoresAProyecto(valores))}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
