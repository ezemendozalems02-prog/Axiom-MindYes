"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, X } from "lucide-react";

import type { Tarea } from "@/types/accion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DURACIONES = [25, 50, 90] as const;

function formatTiempo(segundos: number) {
  const m = Math.floor(segundos / 60).toString().padStart(2, "0");
  const s = (segundos % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function ModoProfundo({
  tarea,
  onSalir,
  onRegistrarTiempo,
  onCompletar,
}: {
  tarea: Tarea;
  onSalir: () => void;
  onRegistrarTiempo: (tareaId: string, minutos: number) => void;
  onCompletar: (tareaId: string) => void;
}) {
  const [duracionMin, setDuracionMin] = useState<number>(25);
  const [segundosRestantes, setSegundosRestantes] = useState(duracionMin * 60);
  const [corriendo, setCorriendo] = useState(false);
  const [notas, setNotas] = useState("");
  const [terminada, setTerminada] = useState(false);
  const segundosTranscurridos = useRef(0);

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
      segundosTranscurridos.current += 1;
      setSegundosRestantes((s) => {
        if (s <= 1) {
          setCorriendo(false);
          setTerminada(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [corriendo]);

  function cambiarDuracion(min: number) {
    setDuracionMin(min);
    setSegundosRestantes(min * 60);
    setCorriendo(false);
    setTerminada(false);
    segundosTranscurridos.current = 0;
  }

  function finalizarSesion(completo: boolean) {
    const minutos = Math.max(1, Math.round(segundosTranscurridos.current / 60));
    onRegistrarTiempo(tarea.id, minutos);
    if (completo) onCompletar(tarea.id);
    onSalir();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[oklch(0.12_0.004_264)]">
      <div className="flex items-center justify-between px-8 py-5">
        <span className="text-sm font-medium tracking-wide text-text-muted uppercase">
          Trabajo profundo
        </span>
        <Button variant="ghost" size="icon" onClick={onSalir} aria-label="Salir (Esc)">
          <X className="size-4" />
        </Button>
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 pb-16">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Tarea activa
          </span>
          <h1 className="text-2xl font-semibold text-foreground">{tarea.titulo}</h1>
          <p className="text-sm text-text-secondary">{tarea.area}</p>
        </div>

        {!terminada ? (
          <div className="flex flex-col items-center gap-5 rounded-xl border border-border bg-card py-10">
            <div className="flex items-center gap-1.5">
              {DURACIONES.map((d) => (
                <button
                  key={d}
                  onClick={() => cambiarDuracion(d)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    duracionMin === d
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-text-secondary hover:text-foreground"
                  )}
                >
                  {d} min
                </button>
              ))}
            </div>

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
                onClick={() => cambiarDuracion(duracionMin)}
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-primary/30 bg-card py-10 text-center">
            <span className="text-lg font-medium text-foreground">
              Sesión terminada — ¿completaste la tarea?
            </span>
            <p className="text-sm text-text-secondary">
              {/* eslint-disable-next-line react-hooks/refs */}
              Tiempo invertido: {Math.max(1, Math.round(segundosTranscurridos.current / 60))} min
            </p>
            <div className="flex items-center gap-3">
              <Button onClick={() => finalizarSesion(true)}>Sí, completada</Button>
              <Button variant="secondary" onClick={() => finalizarSesion(false)}>
                Todavía no
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col gap-2">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Notas rápidas
          </span>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Capturá ideas sin salir del modo profundo…"
            className="min-h-32 flex-1 resize-none rounded-md border border-border bg-popover p-3 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
    </div>
  );
}
