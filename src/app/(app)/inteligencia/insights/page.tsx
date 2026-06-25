"use client";

import { Zap, Star, Compass, HeartPulse } from "lucide-react";

import { useMotorInteligencia } from "@/hooks/use-motor-inteligencia";
import type { TipoInsightMotor } from "@/types/inteligencia";

const ETIQUETAS_INDICE = [
  { key: "claridad" as const, label: "Claridad" },
  { key: "ejecucion" as const, label: "Ejecución" },
  { key: "consistencia" as const, label: "Consistencia" },
  { key: "balance" as const, label: "Balance" },
  { key: "tranquilidad" as const, label: "Tranquilidad" },
];

const ICONO: Record<TipoInsightMotor, typeof Zap> = {
  accion_inmediata: Zap,
  accion_del_dia: Star,
  accion_estrategica: Compass,
  accion_bienestar: HeartPulse,
};

const LABEL: Record<TipoInsightMotor, string> = {
  accion_inmediata: "Acción inmediata",
  accion_del_dia: "Acción del día",
  accion_estrategica: "Acción estratégica",
  accion_bienestar: "Acción de bienestar",
};

const ESTILO: Record<TipoInsightMotor, string> = {
  accion_inmediata: "text-primary bg-primary/15",
  accion_del_dia: "text-warning bg-warning/15",
  accion_estrategica: "text-success bg-success/15",
  accion_bienestar: "text-destructive bg-destructive/15",
};

export default function InsightsPage() {
  const { indices, niveles } = useMotorInteligencia();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Insights</h1>
        <p className="text-sm text-text-secondary">
          No es un chat. Es un analista silencioso que observa todos tus módulos.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-5 sm:grid-cols-5">
        {ETIQUETAS_INDICE.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-1">
            <span className="text-xs text-text-muted">{label}</span>
            <span className="text-2xl font-semibold text-foreground">{indices[key]}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {niveles.recomendacion.map((insight) => {
          const Icon = ICONO[insight.tipo];
          return (
            <div
              key={insight.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${ESTILO[insight.tipo]}`}
              >
                <Icon className="size-4" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                  {LABEL[insight.tipo]}
                </span>
                <p className="text-sm text-foreground">{insight.texto}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
