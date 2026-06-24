import { Clock, Flame } from "lucide-react";

import type { PrioridadAbsoluta as PrioridadAbsolutaType } from "@/types/centro-de-control";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const IMPACTO_STYLES: Record<string, string> = {
  Alto: "bg-warning/15 text-warning",
  Medio: "bg-primary/15 text-primary",
  Bajo: "bg-muted text-text-secondary",
};

export function PrioridadAbsoluta({
  prioridad,
  onComenzar,
  onCambiar,
}: {
  prioridad: PrioridadAbsolutaType;
  onComenzar?: () => void;
  onCambiar?: () => void;
}) {
  const horas = Math.floor(prioridad.tiempoEstimadoMin / 60);
  const minutos = prioridad.tiempoEstimadoMin % 60;
  const tiempo = `${horas > 0 ? `${horas}h ` : ""}${minutos > 0 ? `${minutos}min` : ""}`.trim();

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-card p-7 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-text-muted uppercase">
          Prioridad absoluta
        </span>
        <Badge className={cn(IMPACTO_STYLES[prioridad.impacto])}>
          <Flame data-icon="inline-start" />
          Impacto {prioridad.impacto}
        </Badge>
      </div>

      <h2 className="text-2xl font-semibold text-foreground">
        {prioridad.titulo}
      </h2>

      <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
        <span>{prioridad.proyecto}</span>
        <span className="text-text-muted">·</span>
        <span>{prioridad.objetivo}</span>
        <span className="text-text-muted">·</span>
        <span>{prioridad.area}</span>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-text-secondary">
        <Clock className="size-3.5" />
        {tiempo} estimadas
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Button size="lg" onClick={onComenzar}>
          Comenzar
        </Button>
        <Button size="lg" variant="ghost" onClick={onCambiar}>
          Cambiar prioridad
        </Button>
      </div>
    </section>
  );
}
