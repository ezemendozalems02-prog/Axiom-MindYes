"use client";

import { useState } from "react";
import { ArrowRight, Lightbulb, Plus, Pencil } from "lucide-react";

import type { Idea } from "@/types/mente";
import { useMenteStore } from "@/stores/mente-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormDialog, type CampoForm } from "@/components/ui/form-dialog";
import { getHoyISO } from "@/lib/hoy";
import { cn } from "@/lib/utils";

const CAMPOS: CampoForm[] = [
  { key: "titulo", label: "Título", type: "text" },
  { key: "descripcion", label: "Descripción", type: "textarea" },
  { key: "area", label: "Área de vida", type: "text" },
  { key: "potencial", label: "Potencial", type: "select", opciones: ["Baja", "Media", "Alta", "Transformadora"] },
  { key: "accionesPosibles", label: "Acciones posibles (separadas por coma)", type: "tags" },
];

const POTENCIAL_COLOR: Record<string, string> = {
  Transformadora: "bg-primary/15 text-primary",
  Alta: "bg-warning/15 text-warning",
  Media: "bg-secondary text-text-secondary",
  Baja: "bg-muted text-text-muted",
};

const ESTADO_COLOR: Record<string, string> = {
  Nueva: "bg-primary/15 text-primary",
  "En análisis": "bg-warning/15 text-warning",
  Convertida: "bg-success/15 text-success",
  Archivada: "bg-muted text-text-muted",
  Descartada: "bg-muted text-text-muted",
};

const DESTINOS = ["Proyecto", "Tarea", "Objetivo", "Nota", "Decisión"] as const;

export default function IdeasPage() {
  const ideas = useMenteStore((s) => s.ideas);
  const convertirIdea = useMenteStore((s) => s.convertirIdea);
  const agregarIdea = useMenteStore((s) => s.agregarIdea);
  const actualizarIdea = useMenteStore((s) => s.actualizarIdea);
  const [confirmacion, setConfirmacion] = useState<string | null>(null);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [editando, setEditando] = useState<Idea | null>(null);

  function convertir(id: string, titulo: string, destino: (typeof DESTINOS)[number]) {
    convertirIdea(id, destino);
    setConfirmacion(`"${titulo}" convertida en ${destino}.`);
    setTimeout(() => setConfirmacion(null), 3000);
  }

  function abrirNueva() {
    setEditando(null);
    setDialogAbierto(true);
  }

  function abrirEditar(idea: Idea) {
    setEditando(idea);
    setDialogAbierto(true);
  }

  function guardar(valores: Record<string, unknown>) {
    const datos = {
      titulo: String(valores.titulo),
      descripcion: String(valores.descripcion),
      area: String(valores.area),
      potencial: valores.potencial as Idea["potencial"],
      accionesPosibles: valores.accionesPosibles as string[],
    };
    if (editando) {
      actualizarIdea(editando.id, datos);
    } else {
      agregarIdea({
        id: crypto.randomUUID(),
        ...datos,
        estado: "Nueva",
        origen: "Manual",
        fecha: getHoyISO(),
      });
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-8 py-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Ideas</h1>
          <p className="text-sm text-text-secondary">{ideas.length} ideas registradas</p>
        </div>
        <Button size="sm" onClick={abrirNueva}>
          <Plus data-icon="inline-start" />
          Nueva Idea
        </Button>
      </div>

      {confirmacion && (
        <div className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          {confirmacion}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="size-4 shrink-0 text-text-muted" />
                <span className="text-base font-medium text-foreground">{idea.titulo}</span>
                <button
                  onClick={() => abrirEditar(idea)}
                  className="text-text-muted hover:text-foreground"
                  aria-label="Editar idea"
                >
                  <Pencil className="size-3" />
                </button>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge className={cn(POTENCIAL_COLOR[idea.potencial])}>{idea.potencial}</Badge>
                <Badge className={cn(ESTADO_COLOR[idea.estado])}>{idea.estado}</Badge>
              </div>
            </div>

            {idea.descripcion && (
              <p className="text-sm text-text-secondary">{idea.descripcion}</p>
            )}

            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span>{idea.area}</span>
              <span>·</span>
              <span>Origen: {idea.origen}</span>
              <span>·</span>
              <span>{idea.fecha}</span>
            </div>

            {idea.accionesPosibles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {idea.accionesPosibles.map((accion) => (
                  <span
                    key={accion}
                    className="rounded-full bg-secondary px-2.5 py-1 text-xs text-text-secondary"
                  >
                    {accion}
                  </span>
                ))}
              </div>
            )}

            {idea.estado !== "Convertida" && (
              <div className="flex items-center justify-end border-t border-border pt-3">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button size="sm" variant="secondary">
                        Convertir en
                        <ArrowRight data-icon="inline-end" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    {DESTINOS.map((destino) => (
                      <DropdownMenuItem
                        key={destino}
                        onClick={() => convertir(idea.id, idea.titulo, destino)}
                      >
                        {destino}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        ))}
      </div>

      <FormDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        title={editando ? "Editar idea" : "Nueva idea"}
        campos={CAMPOS}
        datosIniciales={editando ?? undefined}
        onGuardar={guardar}
        submitLabel={editando ? "Guardar cambios" : "Crear idea"}
      />
    </div>
  );
}
