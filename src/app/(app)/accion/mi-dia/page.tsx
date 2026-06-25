"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";

import type { Tarea } from "@/types/accion";
import { useAccionStore } from "@/stores/accion-store";
import { useMotorInteligencia } from "@/hooks/use-motor-inteligencia";
import { ordenarPorPrioridad } from "@/lib/priorizacion";
import { getHoyISO } from "@/lib/hoy";
import { TareaRow } from "@/components/accion/tarea-row";
import { ModoProfundo } from "@/components/accion/modo-profundo";
import { MetricasModulo } from "@/components/accion/metricas-modulo";
import { Button } from "@/components/ui/button";

const MAX_VISIBLES = 7;

function energiaDesdeIndice(foco: number): "Alta" | "Media" | "Baja" {
  if (foco >= 70) return "Alta";
  if (foco >= 40) return "Media";
  return "Baja";
}

export default function MiDiaPage() {
  const hoy = getHoyISO();
  const todasLasTareas = useAccionStore((s) => s.tareas);
  const proyectos = useAccionStore((s) => s.proyectos);
  const toggleCompletada = useAccionStore((s) => s.toggleCompletada);
  const registrarTiempo = useAccionStore((s) => s.registrarTiempo);
  const actualizarTarea = useAccionStore((s) => s.actualizarTarea);
  const { indices } = useMotorInteligencia();

  const [orden, setOrden] = useState<string[]>([]);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [tareaActiva, setTareaActiva] = useState<Tarea | null>(null);
  const [arrastrandoId, setArrastrandoId] = useState<string | null>(null);

  const tareasDeHoy = useMemo(
    () => todasLasTareas.filter((t) => t.fechaProgramada === hoy && !t.bandeja),
    [todasLasTareas, hoy]
  );

  useEffect(() => {
    const energia = energiaDesdeIndice(indices.ejecucion);
    const ordenadas = ordenarPorPrioridad(tareasDeHoy, energia, hoy);
    setOrden((prev) => {
      const idsActuales = new Set(tareasDeHoy.map((t) => t.id));
      const conservado = prev.filter((id) => idsActuales.has(id));
      const nuevos = ordenadas.map((t) => t.id).filter((id) => !conservado.includes(id));
      return conservado.length > 0 ? [...conservado, ...nuevos] : ordenadas.map((t) => t.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tareasDeHoy.length, indices.ejecucion]);

  const porId = useMemo(
    () => Object.fromEntries(tareasDeHoy.map((t) => [t.id, t])),
    [tareasDeHoy]
  );
  const proyectoPorId = useMemo(
    () => Object.fromEntries(proyectos.map((p) => [p.id, p.nombre])),
    [proyectos]
  );

  const ordenTareas = orden.map((id) => porId[id]).filter(Boolean);
  const pendientes = ordenTareas.filter((t) => t.estado !== "completado");
  const completadas = ordenTareas.filter((t) => t.estado === "completado");

  const visibles = pendientes.slice(0, MAX_VISIBLES);
  const colapsadas = pendientes.slice(MAX_VISIBLES);

  const sugerida = visibles[0];

  function moverOrden(idArrastrado: string, idDestino: string) {
    if (idArrastrado === idDestino) return;
    setOrden((prev) => {
      const next = [...prev];
      const from = next.indexOf(idArrastrado);
      const to = next.indexOf(idDestino);
      next.splice(from, 1);
      next.splice(to, 0, idArrastrado);
      return next;
    });
  }

  function completarTarea(id: string) {
    actualizarTarea(id, { estado: "completado" });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Mi Día</h1>
        <p className="text-sm text-text-secondary">
          {pendientes.length} tareas pendientes
        </p>
      </div>

      <MetricasModulo tareas={todasLasTareas} hoy={hoy} />

      {sugerida && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
          <Sparkles className="size-4 shrink-0 text-primary" />
          <p className="flex-1 text-sm text-foreground">
            Tu siguiente mejor acción es <strong>{sugerida.titulo}</strong>. ¿Empezamos?
          </p>
          <Button size="sm" onClick={() => setTareaActiva(sugerida)}>
            Empezar
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {visibles.map((tarea) => (
            <motion.div
              key={tarea.id}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <TareaRow
                tarea={tarea}
                proyectoNombre={tarea.proyectoId ? proyectoPorId[tarea.proyectoId] : undefined}
                draggable
                dragging={arrastrandoId === tarea.id}
                onDragStart={() => setArrastrandoId(tarea.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (arrastrandoId) moverOrden(arrastrandoId, tarea.id);
                  setArrastrandoId(null);
                }}
                onToggleCompletada={toggleCompletada}
                onIniciar={setTareaActiva}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {colapsadas.length > 0 && (
        <button
          onClick={() => setMostrarTodas((v) => !v)}
          className="flex items-center gap-1.5 self-start text-sm text-text-secondary hover:text-foreground"
        >
          <ChevronDown
            className={`size-3.5 transition-transform ${mostrarTodas ? "rotate-180" : ""}`}
          />
          {mostrarTodas ? "Ocultar" : `+${colapsadas.length} más`}
        </button>
      )}

      {mostrarTodas && (
        <div className="flex flex-col gap-2">
          {colapsadas.map((tarea) => (
            <TareaRow
              key={tarea.id}
              tarea={tarea}
              proyectoNombre={tarea.proyectoId ? proyectoPorId[tarea.proyectoId] : undefined}
              onToggleCompletada={toggleCompletada}
              onIniciar={setTareaActiva}
            />
          ))}
        </div>
      )}

      {completadas.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Completadas hoy
          </span>
          <AnimatePresence initial={false}>
            {completadas.map((tarea) => (
              <motion.div
                key={tarea.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <TareaRow
                  tarea={tarea}
                  proyectoNombre={tarea.proyectoId ? proyectoPorId[tarea.proyectoId] : undefined}
                  onToggleCompletada={toggleCompletada}
                  onIniciar={setTareaActiva}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {tareaActiva && (
        <ModoProfundo
          tarea={tareaActiva}
          onSalir={() => setTareaActiva(null)}
          onRegistrarTiempo={registrarTiempo}
          onCompletar={completarTarea}
        />
      )}
    </div>
  );
}
