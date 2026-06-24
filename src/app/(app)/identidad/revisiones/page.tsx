"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

import type { Revision, TipoRevision } from "@/types/identidad";
import type { Tarea } from "@/types/accion";
import { useIdentidadStore } from "@/stores/identidad-store";
import { useAccionStore } from "@/stores/accion-store";
import { getHoyISO, getMananaISO } from "@/lib/hoy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PREGUNTAS: Record<TipoRevision, string[]> = {
  diaria: [
    "¿Qué logré?",
    "¿Qué quedó pendiente?",
    "¿Qué aprendí?",
    "¿Cómo estuvo mi energía?",
    "¿Qué hago mañana?",
  ],
  semanal: [
    "Negocio",
    "Salud",
    "Finanzas",
    "Hábitos",
    "Objetivos",
    "Aprendizajes de la semana",
  ],
  mensual: [
    "¿Qué funcionó este mes?",
    "¿Qué no funcionó?",
    "Ajustes a objetivos",
    "Plan del mes siguiente",
  ],
};

const TIPO_LABEL: Record<TipoRevision, string> = {
  diaria: "Diaria",
  semanal: "Semanal",
  mensual: "Mensual",
};

function parsearPendientes(texto: string): string[] {
  return texto
    .split(/[\n;]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function RevisionesPage() {
  const revisiones = useIdentidadStore((s) => s.revisiones);
  const agregarRevision = useIdentidadStore((s) => s.agregarRevision);
  const agregarTarea = useAccionStore((s) => s.agregarTarea);

  const [tipo, setTipo] = useState<TipoRevision>("diaria");
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [expandidaId, setExpandidaId] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState<string | null>(null);

  function cambiarTipo(nuevo: TipoRevision) {
    setTipo(nuevo);
    setRespuestas({});
  }

  function guardarRevision() {
    const revision: Revision = {
      id: crypto.randomUUID(),
      tipo,
      fecha: getHoyISO(),
      respuestas,
      creadaEn: new Date().toISOString(),
    };
    agregarRevision(revision);

    if (tipo === "diaria") {
      const pendientesTexto = respuestas["¿Qué quedó pendiente?"] ?? "";
      const pendientes = parsearPendientes(pendientesTexto);
      const mañana = getMananaISO();
      pendientes.forEach((titulo) => {
        const nuevaTarea: Tarea = {
          id: crypto.randomUUID(),
          titulo,
          estado: "sin_empezar",
          prioridad: "Media",
          impacto: "Medio",
          urgencia: "Normal",
          energia: "Media",
          tiempoEstimadoMin: 30,
          tiempoRealMin: 0,
          proyectoId: null,
          area: "Organización",
          etiquetas: [],
          dependenciasIds: [],
          fechaLimite: null,
          fechaProgramada: mañana,
          recurrencia: null,
          delegacion: null,
          bandeja: false,
          creadaEn: new Date().toISOString(),
        };
        agregarTarea(nuevaTarea);
      });
      if (pendientes.length > 0) {
        setConfirmacion(
          `${pendientes.length} pendiente(s) agregados a Mi Día de mañana.`
        );
      }
    }

    setRespuestas({});
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-8 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Revisiones</h1>
        <p className="text-sm text-text-secondary">
          Las revisiones nunca se eliminan — construyen tu memoria.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-1 rounded-md bg-secondary p-1">
          {(["diaria", "semanal", "mensual"] as const).map((t) => (
            <button
              key={t}
              onClick={() => cambiarTipo(t)}
              className={cn(
                "rounded-sm px-3 py-1 text-xs font-medium transition-colors",
                tipo === t
                  ? "bg-primary text-primary-foreground"
                  : "text-text-secondary hover:text-foreground"
              )}
            >
              {TIPO_LABEL[t]}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {PREGUNTAS[tipo].map((pregunta) => (
            <div key={pregunta} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
                {pregunta}
              </label>
              <textarea
                value={respuestas[pregunta] ?? ""}
                onChange={(e) =>
                  setRespuestas((prev) => ({ ...prev, [pregunta]: e.target.value }))
                }
                className="min-h-16 resize-none rounded-md border border-border bg-popover p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          ))}
        </div>

        {tipo === "diaria" && (
          <p className="text-xs text-text-muted">
            Cada línea en &quot;¿Qué quedó pendiente?&quot; se convierte en una tarea para
            mañana.
          </p>
        )}

        {confirmacion && (
          <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
            <Sparkles className="size-3.5" />
            {confirmacion}
          </div>
        )}

        <Button onClick={guardarRevision} className="self-start">
          Guardar revisión
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Historial
        </span>
        {revisiones.map((rev) => {
          const expandida = expandidaId === rev.id;
          return (
            <div key={rev.id} className="rounded-lg border border-border bg-card">
              <button
                onClick={() => setExpandidaId(expandida ? null : rev.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <Badge variant="secondary">{TIPO_LABEL[rev.tipo]}</Badge>
                <span className="flex-1 text-sm text-foreground">{rev.fecha}</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 text-text-muted transition-transform",
                    expandida && "rotate-180"
                  )}
                />
              </button>
              {expandida && (
                <div className="flex flex-col gap-3 border-t border-border px-4 py-3">
                  {Object.entries(rev.respuestas).map(([pregunta, respuesta]) => (
                    <div key={pregunta} className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-text-muted">
                        {pregunta}
                      </span>
                      <span className="text-sm text-foreground">{respuesta || "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
