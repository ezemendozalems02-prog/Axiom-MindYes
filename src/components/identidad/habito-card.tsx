"use client";

import { motion } from "framer-motion";
import { Check, X, Flame } from "lucide-react";

import type { EstadoHabitoDia, Habito } from "@/types/identidad";
import { Heatmap } from "@/components/identidad/heatmap";
import { calcularConsistencia4Semanas, calcularRachaActual, generarHeatmap30Dias } from "@/lib/habitos";
import { cn } from "@/lib/utils";

export function HabitoCard({
  habito,
  estado,
  onMarcar,
}: {
  habito: Habito;
  estado: EstadoHabitoDia;
  onMarcar: (estado: EstadoHabitoDia) => void;
}) {
  const racha = calcularRachaActual(habito, estado);
  const consistencia = calcularConsistencia4Semanas(habito, estado);
  const dias = generarHeatmap30Dias(habito, estado);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{habito.nombre}</span>
          <span className="text-xs text-text-muted">
            {habito.area} · {habito.horario}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onMarcar("omitido")}
            className={cn(
              "flex size-7 items-center justify-center rounded-full border border-border text-text-muted transition-colors",
              estado === "omitido" && "border-destructive/40 bg-destructive/10 text-destructive"
            )}
            aria-label="Omitir"
          >
            <X className="size-3.5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onMarcar("completado")}
            className={cn(
              "flex size-7 items-center justify-center rounded-full border border-border text-text-muted transition-colors duration-150",
              estado === "completado" && "border-success bg-success/20 text-success"
            )}
            aria-label="Completar"
          >
            <Check className="size-3.5" />
          </motion.button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <Flame className="size-3.5 text-warning" />
          {racha} días
        </span>
        <span>Consistencia {consistencia}%</span>
        <span className="text-text-muted">
          Mejor racha: {habito.mejorRacha}d
        </span>
      </div>

      <Heatmap dias={dias} />
    </div>
  );
}
