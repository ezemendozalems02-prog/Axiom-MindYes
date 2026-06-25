"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";

import type { Tarea } from "@/types/accion";
import { useAccionStore } from "@/stores/accion-store";
import { useDireccionStore } from "@/stores/direccion-store";
import { PRIORIDAD_COLOR, colorProyecto, formatFechaCorta, formatMinutos } from "@/lib/accion-format";
import { camposTarea, valoresATarea } from "@/components/accion/campos-tarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/ui/form-dialog";
import { cn } from "@/lib/utils";

export default function TablaPage() {
  const tareas = useAccionStore((s) => s.tareas);
  const proyectos = useAccionStore((s) => s.proyectos);
  const objetivos = useDireccionStore((s) => s.objetivos);
  const toggleCompletada = useAccionStore((s) => s.toggleCompletada);
  const actualizarTarea = useAccionStore((s) => s.actualizarTarea);
  const eliminarTarea = useAccionStore((s) => s.eliminarTarea);
  const agregarTarea = useAccionStore((s) => s.agregarTarea);

  const [dialogNuevaAbierto, setDialogNuevaAbierto] = useState(false);
  const [tareaEditando, setTareaEditando] = useState<Tarea | null>(null);

  const proyectoPorId = useMemo(
    () => Object.fromEntries(proyectos.map((p) => [p.id, p.nombre])),
    [proyectos]
  );
  const proyectosOpciones = useMemo(
    () => proyectos.map((p) => ({ value: p.id, label: p.nombre })),
    [proyectos]
  );
  const objetivosOpciones = useMemo(
    () => objetivos.map((o) => ({ value: o.id, label: o.titulo })),
    [objetivos]
  );
  const CAMPOS_TAREA = useMemo(
    () => camposTarea(proyectosOpciones, objetivosOpciones),
    [proyectosOpciones, objetivosOpciones]
  );

  const pendientes = tareas
    .filter((t) => !t.bandeja && t.estado !== "completado")
    .sort((a, b) => (a.fechaLimite ?? "9999").localeCompare(b.fechaLimite ?? "9999"));

  function guardarNuevaTarea(valores: Record<string, unknown>) {
    agregarTarea({
      id: crypto.randomUUID(),
      ...valoresATarea(valores),
      estado: "sin_empezar",
      tiempoRealMin: 0,
      dependenciasIds: [],
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: new Date().toISOString().slice(0, 10),
    });
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Tabla</h1>
          <p className="text-sm text-text-secondary">
            {pendientes.length} {pendientes.length === 1 ? "tarea" : "tareas"} por hacer, personales y de proyecto.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogNuevaAbierto(true)}>
          <Plus data-icon="inline-start" />
          Nueva tarea
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-popover/40 text-left text-xs font-medium text-text-muted uppercase tracking-wide">
              <th className="w-10 px-3 py-2.5"></th>
              <th className="px-3 py-2.5">Tarea</th>
              <th className="px-3 py-2.5">Fecha límite</th>
              <th className="px-3 py-2.5">Prioridad</th>
              <th className="px-3 py-2.5">Proyecto</th>
              <th className="px-3 py-2.5">Detalle</th>
              <th className="w-16 px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {pendientes.map((t) => (
                <motion.tr
                  key={t.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="border-b border-border last:border-b-0 hover:bg-popover/30"
                >
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => toggleCompletada(t.id)}
                      aria-label="Marcar como hecha"
                      className="group flex size-4 items-center justify-center rounded-sm border border-border hover:border-success hover:bg-success/10"
                    >
                      <Check className="size-3 text-success opacity-0 group-hover:opacity-100" />
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-foreground">{t.titulo}</td>
                  <td className="px-3 py-2.5 text-text-secondary">
                    {formatFechaCorta(t.fechaLimite) ?? "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge className={cn(PRIORIDAD_COLOR[t.prioridad])}>{t.prioridad}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge className={colorProyecto(t.proyectoId)}>
                      {t.proyectoId ? proyectoPorId[t.proyectoId] ?? "Proyecto" : "Personal"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-text-secondary">
                    {formatMinutos(t.tiempoEstimadoMin)}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setTareaEditando(t)}
                        aria-label="Editar tarea"
                        className="text-text-muted hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => eliminarTarea(t.id)}
                        aria-label="Eliminar tarea"
                        className="text-text-muted hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {pendientes.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-text-muted">
            No tenés tareas pendientes. Creá una con &quot;Nueva tarea&quot;.
          </p>
        )}
      </div>

      <FormDialog
        open={dialogNuevaAbierto}
        onOpenChange={setDialogNuevaAbierto}
        title="Nueva tarea"
        campos={CAMPOS_TAREA}
        datosIniciales={{ prioridad: "Media", impacto: "Medio", urgencia: "Normal", energia: "Media" }}
        onGuardar={guardarNuevaTarea}
        submitLabel="Crear tarea"
      />

      <FormDialog
        open={tareaEditando !== null}
        onOpenChange={(v) => !v && setTareaEditando(null)}
        title="Editar tarea"
        campos={CAMPOS_TAREA}
        datosIniciales={tareaEditando ?? undefined}
        onGuardar={(valores) => tareaEditando && actualizarTarea(tareaEditando.id, valoresATarea(valores))}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
