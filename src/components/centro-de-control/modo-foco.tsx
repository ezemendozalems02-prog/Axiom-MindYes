"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, X, Check, Plus } from "lucide-react";

import type { PrioridadAbsoluta } from "@/types/centro-de-control";
import { Button } from "@/components/ui/button";

const DURACION_POMODORO = 25 * 60;

function formatTiempo(segundos: number) {
  const m = Math.floor(segundos / 60)
    .toString()
    .padStart(2, "0");
  const s = (segundos % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function ModoFoco({
  prioridad,
  onSalir,
}: {
  prioridad: PrioridadAbsoluta;
  onSalir: () => void;
}) {
  const [segundosRestantes, setSegundosRestantes] = useState(DURACION_POMODORO);
  const [corriendo, setCorriendo] = useState(false);
  const [notas, setNotas] = useState("");
  const [checklist, setChecklist] = useState<{ id: string; texto: string; hecho: boolean }[]>(
    []
  );
  const [nuevoItem, setNuevoItem] = useState("");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSalir();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onSalir]);

  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => {
      setSegundosRestantes((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [corriendo]);

  function agregarItem() {
    if (!nuevoItem.trim()) return;
    setChecklist((prev) => [
      ...prev,
      { id: crypto.randomUUID(), texto: nuevoItem.trim(), hecho: false },
    ]);
    setNuevoItem("");
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[oklch(0.12_0.004_264)]">
      <div className="flex items-center justify-between px-8 py-5">
        <span className="text-sm font-medium tracking-wide text-text-muted uppercase">
          Modo foco
        </span>
        <Button variant="ghost" size="icon" onClick={onSalir} aria-label="Salir (Esc)">
          <X className="size-4" />
        </Button>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 pb-16">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Prioridad absoluta
          </span>
          <h1 className="text-2xl font-semibold text-foreground">
            {prioridad.titulo}
          </h1>
          <p className="text-sm text-text-secondary">
            {prioridad.proyecto} · {prioridad.area}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-10">
          <span className="text-6xl font-bold tabular-nums text-foreground">
            {formatTiempo(segundosRestantes)}
          </span>
          <div className="flex items-center gap-2">
            <Button size="icon-lg" onClick={() => setCorriendo((c) => !c)}>
              {corriendo ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <Button
              size="icon-lg"
              variant="ghost"
              onClick={() => {
                setCorriendo(false);
                setSegundosRestantes(DURACION_POMODORO);
              }}
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Checklist
          </span>
          <div className="flex flex-col gap-1.5">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  setChecklist((prev) =>
                    prev.map((i) =>
                      i.id === item.id ? { ...i, hecho: !i.hecho } : i
                    )
                  )
                }
                className="flex items-center gap-2 text-left text-sm"
              >
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded-sm border border-border ${
                    item.hecho ? "border-success bg-success/20 text-success" : ""
                  }`}
                >
                  {item.hecho && <Check className="size-3" />}
                </span>
                <span
                  className={
                    item.hecho ? "text-text-muted line-through" : "text-foreground"
                  }
                >
                  {item.texto}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <input
              value={nuevoItem}
              onChange={(e) => setNuevoItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarItem()}
              placeholder="Agregar paso…"
              className="h-8 flex-1 rounded-md border border-border bg-popover px-3 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button size="icon" variant="secondary" onClick={agregarItem}>
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Notas rápidas
          </span>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Escribí lo que necesites recordar…"
            className="min-h-32 flex-1 resize-none rounded-md border border-border bg-popover p-3 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
    </div>
  );
}
