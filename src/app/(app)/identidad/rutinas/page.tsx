"use client";

import { useState } from "react";
import { GripVertical, Check, Sunrise, Moon } from "lucide-react";

import { useIdentidadStore } from "@/stores/identidad-store";
import { tiempoEstimadoHabitoMin } from "@/lib/mock/identidad";
import { formatMinutos } from "@/lib/accion-format";
import { cn } from "@/lib/utils";

export default function RutinasPage() {
  const rutinas = useIdentidadStore((s) => s.rutinas);
  const habitos = useIdentidadStore((s) => s.habitos);
  const estadoHoy = useIdentidadStore((s) => s.estadoHoy);
  const marcarHabito = useIdentidadStore((s) => s.marcarHabito);
  const reordenarRutina = useIdentidadStore((s) => s.reordenarRutina);
  const [arrastrando, setArrastrando] = useState<{ rutinaId: string; habitoId: string } | null>(
    null
  );

  const habitoPorId = Object.fromEntries(habitos.map((h) => [h.id, h]));

  function moverHabito(rutinaId: string, habitoIds: string[], desde: string, hacia: string) {
    if (desde === hacia) return;
    const next = [...habitoIds];
    const from = next.indexOf(desde);
    const to = next.indexOf(hacia);
    next.splice(from, 1);
    next.splice(to, 0, desde);
    reordenarRutina(rutinaId, next);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-8 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Rutinas</h1>
        <p className="text-sm text-text-secondary">
          Agrupá tus hábitos en bloques de mañana y noche.
        </p>
      </div>

      {rutinas.map((rutina) => {
        const tiempoTotal = rutina.habitoIds.reduce(
          (acc, id) => acc + (tiempoEstimadoHabitoMin[id] ?? 0),
          0
        );

        return (
          <div key={rutina.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {rutina.momento === "mañana" ? (
                  <Sunrise className="size-4 text-warning" />
                ) : (
                  <Moon className="size-4 text-primary" />
                )}
                <span className="text-base font-medium text-foreground">
                  {rutina.nombre}
                </span>
              </div>
              <span className="text-xs text-text-muted">
                {formatMinutos(tiempoTotal)} en total
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {rutina.habitoIds.map((habitoId) => {
                const habito = habitoPorId[habitoId];
                if (!habito) return null;
                const estado = estadoHoy[habitoId] ?? "pendiente";
                const completado = estado === "completado";

                return (
                  <div
                    key={habitoId}
                    draggable
                    onDragStart={() => setArrastrando({ rutinaId: rutina.id, habitoId })}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (arrastrando && arrastrando.rutinaId === rutina.id) {
                        moverHabito(rutina.id, rutina.habitoIds, arrastrando.habitoId, habitoId);
                      }
                      setArrastrando(null);
                    }}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-opacity",
                      arrastrando?.habitoId === habitoId && "opacity-40"
                    )}
                  >
                    <GripVertical className="size-4 shrink-0 cursor-grab text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                    <button
                      onClick={() => marcarHabito(habitoId, "completado")}
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border border-border transition-colors duration-150",
                        completado && "border-success bg-success/20 text-success"
                      )}
                    >
                      {completado && <Check className="size-3" />}
                    </button>
                    <span
                      className={cn(
                        "flex-1 text-sm text-foreground",
                        completado && "text-text-muted line-through"
                      )}
                    >
                      {habito.nombre}
                    </span>
                    <span className="text-xs text-text-muted">
                      {formatMinutos(tiempoEstimadoHabitoMin[habitoId] ?? 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
