"use client";

import { useState } from "react";
import { AlertTriangle, Check, ChevronDown, ListPlus, Sparkles } from "lucide-react";

import { useMenteStore } from "@/stores/mente-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getHoyISO } from "@/lib/hoy";

const IMPACTO_COLOR: Record<string, string> = {
  Alto: "bg-warning/15 text-warning",
  Medio: "bg-primary/15 text-primary",
  Bajo: "bg-muted text-text-secondary",
};

const ESTADO_COLOR: Record<string, string> = {
  Abierta: "bg-primary/15 text-primary",
  "En análisis": "bg-warning/15 text-warning",
  Tomada: "bg-success/15 text-success",
  Descartada: "bg-muted text-text-muted",
};

const DIAS_ALERTA = 5;

function diasDesde(fechaISO: string): number {
  const hoy = new Date(getHoyISO() + "T00:00:00");
  const desde = new Date(fechaISO.slice(0, 10) + "T00:00:00");
  return Math.round((hoy.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DecisionesPage() {
  const decisiones = useMenteStore((s) => s.decisiones);
  const tomarDecision = useMenteStore((s) => s.tomarDecision);
  const generarTareasDeImplementacion = useMenteStore(
    (s) => s.generarTareasDeImplementacion
  );

  const [expandidaId, setExpandidaId] = useState<string | null>(null);
  const [resultadoTexto, setResultadoTexto] = useState<Record<string, string>>({});
  const [tareasTexto, setTareasTexto] = useState<Record<string, string>>({});
  const [confirmacion, setConfirmacion] = useState<string | null>(null);

  const abiertas = decisiones.filter((d) => d.estado === "Abierta" || d.estado === "En análisis");
  const resueltas = decisiones.filter((d) => d.estado === "Tomada" || d.estado === "Descartada");

  const prioridadAbiertas = [...abiertas].sort(
    (a, b) => diasDesde(b.creadaEn) - diasDesde(a.creadaEn)
  );

  function confirmarDecision(id: string) {
    const resultado = (resultadoTexto[id] ?? "").trim();
    if (!resultado) return;
    tomarDecision(id, resultado);
    setConfirmacion("Decisión tomada. Ahora podés generar tareas de implementación.");
    setTimeout(() => setConfirmacion(null), 3000);
  }

  function generarTareas(id: string) {
    const titulos = (tareasTexto[id] ?? "")
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    if (titulos.length === 0) return;
    generarTareasDeImplementacion(id, titulos);
    setTareasTexto((prev) => ({ ...prev, [id]: "" }));
    setConfirmacion(`${titulos.length} tarea(s) agregadas a tu Bandeja de Acción.`);
    setTimeout(() => setConfirmacion(null), 3000);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-8 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Decisiones</h1>
        <p className="text-sm text-text-secondary">
          Las personas no procrastinan tareas. Procrastinan decisiones.
        </p>
      </div>

      {confirmacion && (
        <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
          <Sparkles className="size-3.5" />
          {confirmacion}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Pendientes ({prioridadAbiertas.length})
        </span>

        {prioridadAbiertas.map((decision) => {
          const dias = diasDesde(decision.creadaEn);
          const expandida = expandidaId === decision.id;
          return (
            <div key={decision.id} className="rounded-lg border border-border bg-card">
              <button
                onClick={() => setExpandidaId(expandida ? null : decision.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left"
              >
                <span className="flex-1 text-sm font-medium text-foreground">
                  {decision.problema}
                </span>
                <Badge className={cn(IMPACTO_COLOR[decision.impacto])}>
                  Impacto {decision.impacto}
                </Badge>
                {dias >= DIAS_ALERTA && (
                  <Badge className="bg-destructive/15 text-destructive">
                    <AlertTriangle data-icon="inline-start" />
                    {dias} días sin resolver
                  </Badge>
                )}
                <ChevronDown
                  className={cn(
                    "size-3.5 text-text-muted transition-transform",
                    expandida && "rotate-180"
                  )}
                />
              </button>

              {expandida && (
                <div className="flex flex-col gap-4 border-t border-border px-5 py-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {decision.opciones.map((opcion) => (
                      <div
                        key={opcion.nombre}
                        className="flex flex-col gap-2 rounded-md bg-popover p-3"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {opcion.nombre}
                        </span>
                        <div className="flex flex-col gap-1">
                          {opcion.pros.map((pro) => (
                            <span key={pro} className="text-xs text-success">
                              + {pro}
                            </span>
                          ))}
                          {opcion.contras.map((contra) => (
                            <span key={contra} className="text-xs text-destructive">
                              − {contra}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-text-secondary">
                    <span className="text-text-muted">Costo / riesgo:</span>{" "}
                    {decision.costoRiesgo || "—"}
                  </p>

                  <div className="flex flex-col gap-2 border-t border-border pt-3">
                    <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
                      ¿Qué decidiste?
                    </label>
                    <textarea
                      value={resultadoTexto[decision.id] ?? ""}
                      onChange={(e) =>
                        setResultadoTexto((prev) => ({
                          ...prev,
                          [decision.id]: e.target.value,
                        }))
                      }
                      className="min-h-16 resize-none rounded-md border border-border bg-popover p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <Button size="sm" className="self-start" onClick={() => confirmarDecision(decision.id)}>
                      <Check data-icon="inline-start" />
                      Marcar como tomada
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {prioridadAbiertas.length === 0 && (
          <p className="text-sm text-text-muted">No tenés decisiones pendientes.</p>
        )}
      </div>

      {resueltas.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Resueltas
          </span>
          {resueltas.map((decision) => (
            <div key={decision.id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">{decision.problema}</span>
                <Badge className={cn(ESTADO_COLOR[decision.estado])}>{decision.estado}</Badge>
              </div>
              {decision.resultado && (
                <p className="text-sm text-text-secondary">
                  <span className="text-text-muted">Resultado:</span> {decision.resultado}
                </p>
              )}

              {decision.estado === "Tomada" && (
                <div className="flex flex-col gap-2 border-t border-border pt-3">
                  <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
                    Generar tareas de implementación (una por línea)
                  </label>
                  <textarea
                    value={tareasTexto[decision.id] ?? ""}
                    onChange={(e) =>
                      setTareasTexto((prev) => ({ ...prev, [decision.id]: e.target.value }))
                    }
                    className="min-h-16 resize-none rounded-md border border-border bg-popover p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="self-start"
                    onClick={() => generarTareas(decision.id)}
                  >
                    <ListPlus data-icon="inline-start" />
                    Generar tareas
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
