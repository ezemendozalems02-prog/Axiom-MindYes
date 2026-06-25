"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy, Plus } from "lucide-react";

import type { Habito } from "@/types/identidad";
import { useIdentidadStore } from "@/stores/identidad-store";
import { HabitoCard } from "@/components/identidad/habito-card";
import { Button } from "@/components/ui/button";
import { FormDialog, type CampoForm } from "@/components/ui/form-dialog";

const CAMPOS: CampoForm[] = [
  { key: "nombre", label: "Nombre", type: "text", placeholder: "Ej: Meditar" },
  { key: "area", label: "Área de vida", type: "text", placeholder: "Ej: Salud" },
  { key: "horario", label: "Horario", type: "select", opciones: ["mañana", "tarde", "noche", "sin_horario"] },
  { key: "energia", label: "Energía requerida", type: "select", opciones: ["Alta", "Media", "Baja"] },
  { key: "frecuenciaTipo", label: "Frecuencia", type: "select", opciones: ["diaria", "semanal"] },
  { key: "vecesPorSemana", label: "Veces por semana (si es semanal)", type: "number", placeholder: "4" },
  { key: "motivacion", label: "Motivación", type: "textarea", placeholder: "¿Para qué lo hacés?" },
];

export default function HabitosPage() {
  const habitos = useIdentidadStore((s) => s.habitos);
  const estadoHoy = useIdentidadStore((s) => s.estadoHoy);
  const marcarHabito = useIdentidadStore((s) => s.marcarHabito);
  const agregarHabito = useIdentidadStore((s) => s.agregarHabito);
  const actualizarHabito = useIdentidadStore((s) => s.actualizarHabito);
  const eliminarHabito = useIdentidadStore((s) => s.eliminarHabito);
  const indiceConsistencia = useIdentidadStore((s) => s.indiceConsistenciaGlobal());

  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [editando, setEditando] = useState<Habito | null>(null);

  const mejorRachaGlobal = habitos.reduce(
    (mejor, h) => (h.mejorRacha > mejor.mejorRacha ? h : mejor),
    habitos[0]
  );

  const completadosHoy = habitos.filter(
    (h) => (estadoHoy[h.id] ?? "pendiente") === "completado"
  ).length;

  function abrirNuevo() {
    setEditando(null);
    setDialogAbierto(true);
  }

  function abrirEditar(h: Habito) {
    setEditando(h);
    setDialogAbierto(true);
  }

  function guardar(valores: Record<string, unknown>) {
    const frecuencia =
      valores.frecuenciaTipo === "semanal"
        ? { tipo: "semanal" as const, vecesPorSemana: Number(valores.vecesPorSemana) || 3 }
        : { tipo: "diaria" as const };

    if (editando) {
      actualizarHabito(editando.id, {
        nombre: String(valores.nombre),
        area: String(valores.area),
        horario: valores.horario as Habito["horario"],
        energia: valores.energia as Habito["energia"],
        frecuencia,
        motivacion: String(valores.motivacion),
      });
    } else {
      agregarHabito({
        id: crypto.randomUUID(),
        nombre: String(valores.nombre),
        area: String(valores.area),
        horario: valores.horario as Habito["horario"],
        energia: valores.energia as Habito["energia"],
        frecuencia,
        motivacion: String(valores.motivacion),
        mejorRacha: 0,
        mejorRachaFecha: null,
        historial: {},
      });
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Hábitos</h1>
          <p className="text-sm text-text-secondary">
            {completadosHoy}/{habitos.length} completados hoy · Índice de Consistencia{" "}
            {indiceConsistencia}%
          </p>
        </div>
        <Button size="sm" onClick={abrirNuevo}>
          <Plus data-icon="inline-start" />
          Nuevo Hábito
        </Button>
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
                onEditar={() => abrirEditar(habito)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <FormDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        title={editando ? "Editar hábito" : "Nuevo hábito"}
        campos={CAMPOS}
        datosIniciales={
          editando
            ? {
                ...editando,
                frecuenciaTipo: editando.frecuencia.tipo,
                vecesPorSemana:
                  editando.frecuencia.tipo === "semanal" ? editando.frecuencia.vecesPorSemana : 3,
              }
            : undefined
        }
        onGuardar={guardar}
        onEliminar={editando ? () => eliminarHabito(editando.id) : undefined}
        submitLabel={editando ? "Guardar cambios" : "Crear hábito"}
      />
    </div>
  );
}
