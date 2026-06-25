"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, History, NotebookText, BarChart3, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import type { Proyecto } from "@/types/accion";
import { useAccionStore } from "@/stores/accion-store";
import { useMenteStore } from "@/stores/mente-store";
import { TareaRow } from "@/components/accion/tarea-row";
import { calcularProgresoProyecto, formatFechaCorta, formatMinutos } from "@/lib/accion-format";
import { FormDialog, type CampoForm } from "@/components/ui/form-dialog";
import { camposTarea, valoresATarea } from "@/components/accion/campos-tarea";
import { Button } from "@/components/ui/button";
import { getHoyISO } from "@/lib/hoy";

const CAMPOS_NOTA: CampoForm[] = [
  { key: "titulo", label: "Título", type: "text" },
  { key: "contenido", label: "Contenido", type: "textarea", placeholder: "Ej: El cliente pidió mover el botón de contacto arriba." },
];

const CAMPOS_ARCHIVO: CampoForm[] = [
  { key: "nombre", label: "Nombre del archivo", type: "text", placeholder: "Ej: propuesta-final.pdf" },
  { key: "tipo", label: "Tipo", type: "select", opciones: ["PDF", "Imagen", "Documento", "Hoja de cálculo", "Enlace", "Otro"] },
];

const TABS = ["Tareas", "Notas", "Archivos", "Cronología", "Métricas"] as const;

const CAMPOS: CampoForm[] = [
  { key: "nombre", label: "Nombre", type: "text" },
  { key: "area", label: "Área de vida", type: "text" },
  { key: "cliente", label: "Cliente (opcional)", type: "text" },
  { key: "fechaLimite", label: "Fecha límite", type: "date" },
  { key: "estado", label: "Estado", type: "select", opciones: ["en_curso", "pausado", "completado"] },
];

export default function ProyectoDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const proyectos = useAccionStore((s) => s.proyectos);
  const todasLasTareas = useAccionStore((s) => s.tareas);
  const toggleCompletada = useAccionStore((s) => s.toggleCompletada);
  const actualizarProyecto = useAccionStore((s) => s.actualizarProyecto);
  const eliminarProyecto = useAccionStore((s) => s.eliminarProyecto);
  const agregarTarea = useAccionStore((s) => s.agregarTarea);
  const archivos = useAccionStore((s) => s.archivos);
  const agregarArchivo = useAccionStore((s) => s.agregarArchivo);
  const eliminarArchivo = useAccionStore((s) => s.eliminarArchivo);
  const notas = useMenteStore((s) => s.notas);
  const agregarNota = useMenteStore((s) => s.agregarNota);
  const eliminarNota = useMenteStore((s) => s.eliminarNota);
  const proyecto = proyectos.find((p) => p.id === params.id);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Tareas");
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [dialogTareaAbierto, setDialogTareaAbierto] = useState(false);
  const [dialogNotaAbierto, setDialogNotaAbierto] = useState(false);
  const [dialogArchivoAbierto, setDialogArchivoAbierto] = useState(false);
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
  const progreso = calcularProgresoProyecto(proyecto.id, todasLasTareas);
  const notasProyecto = notas.filter(
    (n) => n.vinculo?.tipo === "proyecto" && n.vinculo.valor === proyecto.id
  );
  const archivosProyecto = archivos.filter((a) => a.proyectoId === proyecto.id);

  function guardarNuevaTarea(valores: Record<string, unknown>) {
    if (!proyecto) return;
    agregarTarea({
      id: crypto.randomUUID(),
      ...valoresATarea(valores),
      proyectoId: proyecto.id,
      estado: "sin_empezar",
      tiempoRealMin: 0,
      dependenciasIds: [],
      recurrencia: null,
      delegacion: null,
      bandeja: false,
      creadaEn: getHoyISO(),
    });
  }

  function guardarNuevaNota(valores: Record<string, unknown>) {
    if (!proyecto) return;
    agregarNota({
      id: crypto.randomUUID(),
      titulo: String(valores.titulo),
      contenido: String(valores.contenido),
      vinculo: { tipo: "proyecto", valor: proyecto.id },
      creadaEn: getHoyISO(),
    });
  }

  function guardarNuevoArchivo(valores: Record<string, unknown>) {
    if (!proyecto) return;
    agregarArchivo({
      id: crypto.randomUUID(),
      proyectoId: proyecto.id,
      nombre: String(valores.nombre),
      tipo: String(valores.tipo),
      agregadoEn: getHoyISO(),
    });
  }

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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground">{proyecto.nombre}</h1>
            <button
              onClick={() => setDialogAbierto(true)}
              className="text-text-muted hover:text-foreground"
              aria-label="Editar proyecto"
            >
              <Pencil className="size-3.5" />
            </button>
          </div>
          <span className="text-sm text-text-secondary">{progreso}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progreso}%` }}
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
          <Button size="sm" className="self-start" onClick={() => setDialogTareaAbierto(true)}>
            <Plus data-icon="inline-start" />
            Nueva Tarea
          </Button>
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
        <div className="flex flex-col gap-3">
          <Button size="sm" className="self-start" onClick={() => setDialogNotaAbierto(true)}>
            <Plus data-icon="inline-start" />
            Nueva Nota
          </Button>

          {notasProyecto.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
              <NotebookText className="size-5 text-text-muted" />
              <span className="text-sm text-text-secondary">
                Todavía no hay notas en este proyecto.
              </span>
            </div>
          ) : (
            notasProyecto.map((nota) => (
              <div key={nota.id} className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{nota.titulo}</span>
                  <button
                    onClick={() => eliminarNota(nota.id)}
                    className="text-text-muted hover:text-destructive"
                    aria-label="Eliminar nota"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <p className="text-sm text-text-secondary">{nota.contenido}</p>
                <span className="text-xs text-text-muted">{nota.creadaEn.slice(0, 10)}</span>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "Archivos" && (
        <div className="flex flex-col gap-3">
          <Button size="sm" className="self-start" onClick={() => setDialogArchivoAbierto(true)}>
            <Plus data-icon="inline-start" />
            Agregar Archivo
          </Button>

          {archivosProyecto.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
              <FileText className="size-5 text-text-muted" />
              <span className="text-sm text-text-secondary">
                Todavía no hay archivos adjuntos.
              </span>
            </div>
          ) : (
            archivosProyecto.map((archivo) => (
              <div
                key={archivo.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="size-4 shrink-0 text-text-muted" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{archivo.nombre}</span>
                    <span className="text-xs text-text-muted">
                      {archivo.tipo} · {archivo.agregadoEn}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => eliminarArchivo(archivo.id)}
                  className="text-text-muted hover:text-destructive"
                  aria-label="Eliminar archivo"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))
          )}

          <p className="text-xs text-text-muted">
            Esta sección registra referencias a archivos (nombre y tipo) — no hay almacenamiento real de
            archivos en esta versión.
          </p>
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
              {progreso}%
            </span>
          </div>
        </div>
      )}

      <FormDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        title="Editar proyecto"
        campos={CAMPOS}
        datosIniciales={proyecto}
        onGuardar={(valores) =>
          actualizarProyecto(proyecto.id, {
            nombre: String(valores.nombre),
            area: String(valores.area),
            cliente: valores.cliente ? String(valores.cliente) : undefined,
            fechaLimite: (valores.fechaLimite as string) || null,
            estado: valores.estado as Proyecto["estado"],
          })
        }
        onEliminar={() => {
          eliminarProyecto(proyecto.id);
          router.push("/accion/proyectos");
        }}
        submitLabel="Guardar cambios"
      />

      <FormDialog
        open={dialogTareaAbierto}
        onOpenChange={setDialogTareaAbierto}
        title={`Nueva tarea en ${proyecto.nombre}`}
        campos={camposTarea()}
        datosIniciales={{ area: proyecto.area, prioridad: "Media", impacto: "Medio", urgencia: "Normal", energia: "Media" }}
        onGuardar={guardarNuevaTarea}
        submitLabel="Crear tarea"
      />

      <FormDialog
        open={dialogNotaAbierto}
        onOpenChange={setDialogNotaAbierto}
        title={`Nueva nota en ${proyecto.nombre}`}
        campos={CAMPOS_NOTA}
        onGuardar={guardarNuevaNota}
        submitLabel="Crear nota"
      />

      <FormDialog
        open={dialogArchivoAbierto}
        onOpenChange={setDialogArchivoAbierto}
        title="Agregar archivo"
        campos={CAMPOS_ARCHIVO}
        onGuardar={guardarNuevoArchivo}
        submitLabel="Agregar"
      />
    </div>
  );
}
