"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

import type { EventoCalendario, Tarea } from "@/types/accion";
import { useAccionStore } from "@/stores/accion-store";
import {
  CARGA_COLOR,
  HORA_FIN,
  HORA_INICIO,
  cargaDelDia,
  getInicioSemana,
  posicionEnGrilla,
  toISO,
} from "@/lib/calendario";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FormDialog, type CampoForm } from "@/components/ui/form-dialog";

type VistaCalendario = "diaria" | "semanal" | "mensual";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const CAMPOS_EVENTO: CampoForm[] = [
  { key: "titulo", label: "Título", type: "text", placeholder: "Ej: Llamada con proveedor" },
  { key: "fecha", label: "Fecha", type: "date" },
  { key: "horaInicio", label: "Hora de inicio", type: "time" },
  { key: "horaFin", label: "Hora de fin", type: "time" },
  { key: "tipo", label: "Tipo", type: "select", opciones: ["evento", "bloque_foco"] },
];

function sumarDias(fecha: Date, dias: number) {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d;
}

function GrillaHoraria({
  dias,
  tareas,
  eventosCalendario,
  onEliminarEvento,
}: {
  dias: Date[];
  tareas: Tarea[];
  eventosCalendario: EventoCalendario[];
  onEliminarEvento: (id: string) => void;
}) {
  const horas = Array.from(
    { length: HORA_FIN - HORA_INICIO },
    (_, i) => HORA_INICIO + i
  );

  return (
    <div className="flex flex-1 overflow-x-auto overflow-y-hidden rounded-lg border border-border">
      <div className="sticky left-0 z-10 flex w-14 shrink-0 flex-col border-r border-border bg-popover">
        <div className="h-10 border-b border-border" />
        {horas.map((h) => (
          <div
            key={h}
            className="flex h-16 items-start justify-end pr-2 text-xs text-text-muted"
          >
            {h}:00
          </div>
        ))}
      </div>

      <div
        className="grid flex-1 grid-cols-[repeat(var(--cols),minmax(90px,1fr))]"
        style={{ "--cols": dias.length } as React.CSSProperties}
      >
        {dias.map((dia) => {
          const fechaISO = toISO(dia);
          const eventosDia = eventosCalendario.filter((e) => e.fecha === fechaISO);
          const carga = cargaDelDia(fechaISO, tareas, eventosCalendario);
          const esHoy = fechaISO === toISO(new Date());

          return (
            <div key={fechaISO} className="relative border-r border-border last:border-r-0">
              <div
                className={cn(
                  "flex h-10 flex-col items-center justify-center gap-0.5 border-b border-border",
                  esHoy && "bg-primary/10"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span className={cn("size-1.5 rounded-full", CARGA_COLOR[carga])} />
                  <span className={cn("text-xs font-medium", esHoy ? "text-primary" : "text-foreground")}>
                    {dia.toLocaleDateString("es-AR", { weekday: "short", day: "numeric" })}
                  </span>
                </div>
              </div>

              <div className="relative" style={{ height: (HORA_FIN - HORA_INICIO) * 64 }}>
                {horas.map((h) => (
                  <div key={h} className="h-16 border-b border-border/50" />
                ))}

                {eventosDia.map((ev) => {
                  const { top, height } = posicionEnGrilla(ev.horaInicio, ev.horaFin);
                  return (
                    <div
                      key={ev.id}
                      style={{ top, height }}
                      className={cn(
                        "group absolute inset-x-1 overflow-hidden rounded-md border px-2 py-1 text-xs",
                        ev.tipo === "bloque_foco"
                          ? "border-primary/40 bg-primary/15 text-primary"
                          : "border-border bg-card text-foreground"
                      )}
                    >
                      <button
                        onClick={() => onEliminarEvento(ev.id)}
                        aria-label="Eliminar evento"
                        className="absolute right-1 top-1 hidden text-text-muted hover:text-destructive group-hover:block"
                      >
                        <X className="size-3" />
                      </button>
                      <p className="truncate pr-3 font-medium">{ev.titulo}</p>
                      <p className="truncate text-text-muted">
                        {ev.horaInicio}–{ev.horaFin}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VistaMensual({
  mes,
  tareas,
  eventosCalendario,
}: {
  mes: Date;
  tareas: Tarea[];
  eventosCalendario: EventoCalendario[];
}) {
  const primerDiaMes = new Date(mes.getFullYear(), mes.getMonth(), 1);
  const inicioGrilla = getInicioSemana(primerDiaMes);
  const celdas = Array.from({ length: 42 }, (_, i) => sumarDias(inicioGrilla, i));

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-x-auto">
      <div className="grid min-w-[640px] grid-cols-7 gap-2 text-center text-xs font-medium text-text-muted">
        {DIAS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid min-w-[640px] flex-1 grid-cols-7 gap-2">
        {celdas.map((dia) => {
          const fechaISO = toISO(dia);
          const enMes = dia.getMonth() === mes.getMonth();
          const carga = cargaDelDia(fechaISO, tareas, eventosCalendario);
          const eventosDia = eventosCalendario.filter((e) => e.fecha === fechaISO);
          return (
            <div
              key={fechaISO}
              className={cn(
                "flex min-w-0 flex-col gap-1 rounded-md border border-border p-2",
                !enMes && "opacity-40"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground">{dia.getDate()}</span>
                {eventosDia.length > 0 && (
                  <span className={cn("size-1.5 rounded-full", CARGA_COLOR[carga])} />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                {eventosDia.slice(0, 2).map((e) => (
                  <span key={e.id} className="truncate text-[11px] text-text-secondary">
                    {e.titulo}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarioPage() {
  const tareas = useAccionStore((s) => s.tareas);
  const eventosCalendario = useAccionStore((s) => s.eventosCalendario);
  const agregarEvento = useAccionStore((s) => s.agregarEvento);
  const eliminarEvento = useAccionStore((s) => s.eliminarEvento);

  const [vista, setVista] = useState<VistaCalendario>("semanal");
  const [fechaRef, setFechaRef] = useState(() => new Date());
  const [dialogAbierto, setDialogAbierto] = useState(false);

  const dias = useMemo(() => {
    if (vista === "diaria") return [fechaRef];
    const inicio = getInicioSemana(fechaRef);
    return Array.from({ length: 7 }, (_, i) => sumarDias(inicio, i));
  }, [vista, fechaRef]);

  function navegar(direccion: 1 | -1) {
    if (vista === "diaria") setFechaRef((f) => sumarDias(f, direccion));
    else if (vista === "semanal") setFechaRef((f) => sumarDias(f, direccion * 7));
    else setFechaRef((f) => new Date(f.getFullYear(), f.getMonth() + direccion, 1));
  }

  function guardarEvento(valores: Record<string, unknown>) {
    agregarEvento({
      id: crypto.randomUUID(),
      titulo: String(valores.titulo),
      fecha: String(valores.fecha),
      horaInicio: String(valores.horaInicio),
      horaFin: String(valores.horaFin),
      tipo: valores.tipo as EventoCalendario["tipo"],
    });
  }

  return (
    <div className="flex h-full flex-col gap-4 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-foreground">Calendario</h1>

        <div className="flex items-center gap-1">
          <button
            onClick={() => navegar(-1)}
            className="flex size-7 items-center justify-center rounded-md text-text-secondary hover:bg-secondary"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-40 text-center text-sm text-text-secondary">
            {vista === "mensual"
              ? fechaRef.toLocaleDateString("es-AR", { month: "long", year: "numeric" })
              : `${dias[0].toLocaleDateString("es-AR", { day: "numeric", month: "short" })} – ${dias[dias.length - 1].toLocaleDateString("es-AR", { day: "numeric", month: "short" })}`}
          </span>
          <button
            onClick={() => navegar(1)}
            className="flex size-7 items-center justify-center rounded-md text-text-secondary hover:bg-secondary"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-md bg-secondary p-1">
          {(["diaria", "semanal", "mensual"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className={cn(
                "rounded-sm px-3 py-1 text-xs font-medium capitalize transition-colors",
                vista === v
                  ? "bg-primary text-primary-foreground"
                  : "text-text-secondary hover:text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <Button size="sm" className="ml-auto" onClick={() => setDialogAbierto(true)}>
          <Plus data-icon="inline-start" />
          Nuevo evento
        </Button>
      </div>

      {vista === "mensual" ? (
        <VistaMensual mes={fechaRef} tareas={tareas} eventosCalendario={eventosCalendario} />
      ) : (
        <GrillaHoraria
          dias={dias}
          tareas={tareas}
          eventosCalendario={eventosCalendario}
          onEliminarEvento={eliminarEvento}
        />
      )}

      <FormDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        title="Nuevo evento"
        campos={CAMPOS_EVENTO}
        datosIniciales={{ fecha: toISO(fechaRef), tipo: "evento" }}
        onGuardar={guardarEvento}
        submitLabel="Crear evento"
      />
    </div>
  );
}
