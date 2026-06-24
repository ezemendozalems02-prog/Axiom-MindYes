import { AlertTriangle, Trophy, Repeat, Lightbulb } from "lucide-react";

import type { Insight, TipoInsight } from "@/types/centro-de-control";
import { cn } from "@/lib/utils";

const ICONOS: Record<TipoInsight, typeof AlertTriangle> = {
  alerta: AlertTriangle,
  logro: Trophy,
  patron: Repeat,
  recomendacion: Lightbulb,
};

const ESTILOS: Record<TipoInsight, string> = {
  alerta: "text-warning bg-warning/15",
  logro: "text-success bg-success/15",
  patron: "text-primary bg-primary/15",
  recomendacion: "text-primary bg-primary/15",
};

export function InteligenciaDelDia({ insights }: { insights: Insight[] }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <h3 className="text-xl font-medium text-foreground">
        Inteligencia del día
      </h3>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {insights.slice(0, 5).map((insight) => {
          const Icon = ICONOS[insight.tipo];
          return (
            <div
              key={insight.id}
              className="flex items-start gap-3 rounded-md bg-popover p-3"
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  ESTILOS[insight.tipo]
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <p className="text-sm leading-snug text-foreground">
                {insight.texto}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
