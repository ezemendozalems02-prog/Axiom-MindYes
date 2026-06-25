"use client";

import { useState } from "react";
import { Search, StickyNote, Trash2, Plus, Pencil } from "lucide-react";

import type { Nota } from "@/types/mente";
import { useMenteStore } from "@/stores/mente-store";
import { Button } from "@/components/ui/button";
import { FormDialog, type CampoForm } from "@/components/ui/form-dialog";
import { getHoyISO } from "@/lib/hoy";

const CAMPOS: CampoForm[] = [
  { key: "titulo", label: "Título", type: "text" },
  { key: "contenido", label: "Contenido", type: "textarea" },
];

export default function NotasPage() {
  const notas = useMenteStore((s) => s.notas);
  const eliminarNota = useMenteStore((s) => s.eliminarNota);
  const agregarNota = useMenteStore((s) => s.agregarNota);
  const actualizarNota = useMenteStore((s) => s.actualizarNota);
  const [busqueda, setBusqueda] = useState("");
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [editando, setEditando] = useState<Nota | null>(null);

  const filtradas = notas.filter(
    (n) =>
      n.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.contenido.toLowerCase().includes(busqueda.toLowerCase())
  );

  function abrirNueva() {
    setEditando(null);
    setDialogAbierto(true);
  }

  function abrirEditar(nota: Nota) {
    setEditando(nota);
    setDialogAbierto(true);
  }

  function guardar(valores: Record<string, unknown>) {
    const datos = { titulo: String(valores.titulo), contenido: String(valores.contenido) };
    if (editando) {
      actualizarNota(editando.id, datos);
    } else {
      agregarNota({ id: crypto.randomUUID(), ...datos, vinculo: null, creadaEn: getHoyISO() });
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-8 py-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Notas</h1>
          <p className="text-sm text-text-secondary">{notas.length} notas guardadas</p>
        </div>
        <Button size="sm" onClick={abrirNueva}>
          <Plus data-icon="inline-start" />
          Nueva Nota
        </Button>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-border bg-popover px-3">
        <Search className="size-3.5 text-text-muted" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por contenido…"
          className="h-9 flex-1 bg-transparent text-sm text-foreground placeholder:text-text-muted focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filtradas.map((nota) => (
          <div key={nota.id} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <StickyNote className="size-4 shrink-0 text-text-muted" />
                <span className="text-base font-medium text-foreground">{nota.titulo}</span>
                <button
                  onClick={() => abrirEditar(nota)}
                  className="text-text-muted hover:text-foreground"
                  aria-label="Editar nota"
                >
                  <Pencil className="size-3" />
                </button>
              </div>
              <Button size="icon-sm" variant="ghost" onClick={() => eliminarNota(nota.id)}>
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            <p className="text-sm text-text-secondary">{nota.contenido}</p>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              {nota.vinculo && (
                <span className="rounded-full bg-secondary px-2 py-0.5">
                  {nota.vinculo.tipo}: {nota.vinculo.valor}
                </span>
              )}
              <span>{nota.creadaEn.slice(0, 10)}</span>
            </div>
          </div>
        ))}

        {filtradas.length === 0 && (
          <p className="text-sm text-text-muted">No se encontraron notas.</p>
        )}
      </div>

      <FormDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        title={editando ? "Editar nota" : "Nueva nota"}
        campos={CAMPOS}
        datosIniciales={editando ?? undefined}
        onGuardar={guardar}
        submitLabel={editando ? "Guardar cambios" : "Crear nota"}
      />
    </div>
  );
}
