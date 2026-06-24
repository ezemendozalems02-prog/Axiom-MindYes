"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trophy } from "lucide-react";

import { useIdentidadStore } from "@/stores/identidad-store";
import { HabitoCard } from "@/components/identidad/habito-card";

export default function HabitosPage() {
  const habitos = useIdentidadStore((s) => s.habitos);
  const estadoHoy = useIdentidadStore((s) => s.estadoHoy);
  const marcarHabito = useIdentidadStore((s) => s.marcarHabito);
  const indiceConsistencia = useIdentidadStore((s) => s.indiceConsistenciaGlobal());

  const mejorRachaGlobal = habitos.reduce(
    (mejor, h) => (h.mejorRacha > mejor.mejorRacha ? h : mejor),
    habitos[0]
  );

  const completadosHoy = habitos.filter(
    (h) => (estadoHoy[h.id] ?? "pendiente") === "completado"
  ).length;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-8 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Hábitos</h1>
        <p className="text-sm text-text-secondary">
          {completadosHoy}/{habitos.length} completados hoy · Índice de Consistencia{" "}
          {indiceConsistencia}%
        </p>
      </div>

      {mejorRachaGlobal && (
        <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3">
          <Trophy className="size-4 shrink-0 text-warning" />
          <p className="text-sm text-foreground">
            Tu mejor racha es <strong>{mejorRachaGlobal.nombre}</strong> con{" "}
            {mejorRachaGlobal.mejorRacha} días
            {mejorRachaGlobal.mejorRachaFecha &&
              ` (alcanzada el ${mejorRachaGlobal.mejorRachaFecha})`}
            .
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <AnimatePresence>
          {habitos.map((habito) => (
            <motion.div
              key={habito.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              <HabitoCard
                habito={habito}
                estado={estadoHoy[habito.id] ?? "pendiente"}
                onMarcar={(estado) => marcarHabito(habito.id, estado)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
