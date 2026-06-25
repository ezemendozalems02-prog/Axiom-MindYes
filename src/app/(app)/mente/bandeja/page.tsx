"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Sparkles, ListChecks } from "lucide-react";

import type { ClasificacionBandeja } from "@/types/mente";
import { useMenteStore } from "@/stores/mente-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const OPCIONES: ClasificacionBandeja[] = [
  "Idea",
  "Tarea",
  "Decisión",
  "Nota",
  "Pregunta",
  "Preocupación",
];

export default function BandejaMentalPage() {
  const items = useMenteStore((s) => s.bandeja);
  const capturar = useMenteStore((s) => s.capturar);
  const eliminarDeBandeja = useMenteStore((s) => s.eliminarDeBandeja);
  const clasificarComoTarea = useMenteStore((s) => s.clasificarComoTarea);
  const clasificarComoIdea = useMenteStore((s) => s.clasificarComoIdea);
  const clasificarComoDecision = useMenteStore((s) => s.clasificarComoDecision);
  const clasificarComoNota = useMenteStore((s) => s.clasificarComoNota);

  const [texto, setTexto] = useState("");
  const [confirmacion, setConfirmacion] = useState<string | null>(null);

  function capturarYLimpiar() {
    const valor = texto.trim();
    if (!valor) return;
    capturar(valor);
    setTexto("");
  }

  function clasificar(id: string, tipo: ClasificacionBandeja) {
    if (tipo === "Tarea") clasificarComoTarea(id);
    else if (tipo === "Idea") clasificarComoIdea(id, {});
    else if (tipo === "Decisión") clasificarComoDecision(id, {});
    else clasificarComoNota(id, {});
    setConfirmacion(`Clasificado como ${tipo}.`);
    setTimeout(() => setConfirmacion(null), 2500);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Bandeja Mental</h1>
        <p className="text-sm text-text-secondary">
          Escribí lo que tengas en la cabeza. Clasificás después, no ahora.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
        <Brain className="size-4 shrink-0 text-text-muted" />
        <input
          autoFocus
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && capturarYLimpiar()}
          placeholder="¿Qué te está ocupando la cabeza? Escribí y presioná Enter…"
          className="h-9 flex-1 bg-transparent text-sm text-foreground placeholder:text-text-muted focus:outline-none"
        />
      </div>

      {confirmacion && (
        <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
          <Sparkles className="size-3.5" />
          {confirmacion}
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <ListChecks className="size-6 text-text-muted" />
          <span className="text-sm text-text-secondary">
            Tu cabeza está despejada. No hay nada pendiente de clasificar.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
              >
                <span className="flex-1 text-sm text-foreground">{item.texto}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button size="sm" variant="secondary">
                        Clasificar
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    {OPCIONES.map((op) => (
                      <DropdownMenuItem key={op} onClick={() => clasificar(item.id, op)}>
                        {op}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => eliminarDeBandeja(item.id)}
                >
                  Descartar
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
