"use client";

import { Check, Clock3, CalendarClock } from "lucide-react";

import type { ResumenDelDia as ResumenDelDiaType } from "@/types/centro-de-control";
import { cn } from "@/lib/utils";

function minutosAHoras(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${m > 0 ? ` ${m}min` : ""}`;
}

export function ResumenDelDia({
  resumen,
  onToggleHabito,
}: {
  resumen: ResumenDelDiaType;
  onToggleHabito?: (id: string) => void;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <h3 className="text-xl font-medium text-foreground">Resumen del día</h3>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Críticas de hoy
          </span>
          <ul className="flex flex-col gap-1.5">
            {resumen.tareasCriticas.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between text-sm text-foreground"
              >
                <span>{t.titulo}</span>
                {t.hora && (
                  <span className="text-xs text-text-muted">{t.hora}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Hábitos
          </span>
          <ul className="flex flex-col gap-1.5">
            {resumen.habitos.map((h) => {
              const done = h.completadoHoy;
              return (
                <li key={h.id}>
                  <button
                    onClick={() => onToggleHabito?.(h.id)}
                    className="flex w-full items-center gap-2 text-left text-sm"
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-sm border border-border",
                        done && "border-success bg-success/20 text-success"
                      )}
                    >
                      {done && <Check className="size-3" />}
                    </span>
                    <span
                      className={cn(
                        "text-foreground",
                        done && "text-text-muted line-through"
                      )}
                    >
                      {h.nombre}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Eventos
          </span>
          <ul className="flex flex-col gap-1.5">
            {resumen.eventos.map((e) => (
              <li
                key={e.id}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <CalendarClock className="size-3.5 text-text-muted" />
                <span className="text-text-muted">{e.hora}</span>
                <span>{e.titulo}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3 text-sm text-text-secondary">
        <span className="flex items-center gap-1.5">
          <Clock3 className="size-3.5" />
          {minutosAHoras(resumen.tiempoDisponibleMin)} disponibles
        </span>
        <span className="text-text-muted">·</span>
        <span>
          Bloques libres:{" "}
          {resumen.bloquesLibres
            .map((b) => `${b.inicio}–${b.fin}`)
            .join(", ")}
        </span>
      </div>
    </section>
  );
}
