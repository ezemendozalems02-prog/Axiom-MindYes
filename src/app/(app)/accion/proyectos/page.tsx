"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";

import { useAccionStore } from "@/stores/accion-store";
import { useNegocioStore } from "@/stores/negocio-store";
import { calcularProgresoProyecto, formatFechaCorta } from "@/lib/accion-format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/ui/form-dialog";
import { camposProyecto, valoresAProyecto } from "@/components/accion/campos-proyecto";

export default function ProyectosPage() {
  const proyectos = useAccionStore((s) => s.proyectos);
  const tareas = useAccionStore((s) => s.tareas);
  const agregarProyecto = useAccionStore((s) => s.agregarProyecto);
  const clientes = useNegocioStore((s) => s.clientes);
  const [dialogAbierto, setDialogAbierto] = useState(false);

  const clientesOpciones = useMemo(
    () => clientes.map((c) => ({ value: c.id, label: c.nombre })),
    [clientes]
  );
  const clientePorId = useMemo(
    () => Object.fromEntries(clientes.map((c) => [c.id, c.nombre])),
    [clientes]
  );
  const CAMPOS = useMemo(() => camposProyecto(clientesOpciones), [clientesOpciones]);

  function guardar(valores: Record<string, unknown>) {
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
          <h1 className="text-2xl font-semibold text-foreground">
            Proyectos activos
          </h1>
          <p className="text-sm text-text-secondary">
            {proyectos.length} proyectos en curso
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogAbierto(true)}>
          <Plus data-icon="inline-start" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {proyectos.map((p) => {
          const tareasProyecto = tareas.filter((t) => t.proyectoId === p.id);
          const proximaTarea = tareasProyecto.find((t) => t.estado !== "completado");
          const fechaLimite = formatFechaCorta(p.fechaLimite);
          const progreso = calcularProgresoProyecto(p.id, tareas);

          return (
            <Link
              key={p.id}
              href={`/accion/proyectos/${p.id}`}
              className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-foreground">
                      {p.nombre}
                    </span>
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
                  <span className="text-xs text-text-muted">{p.area}</span>
                </div>
                <ArrowUpRight className="size-4 text-text-muted transition-colors group-hover:text-primary" />
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

              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>
                  Próxima: {proximaTarea ? proximaTarea.titulo : "Sin tareas pendientes"}
                </span>
                {fechaLimite && <span>Vence {fechaLimite}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      <FormDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        title="Nuevo proyecto"
        campos={CAMPOS}
        onGuardar={guardar}
        submitLabel="Crear proyecto"
      />
    </div>
  );
}
