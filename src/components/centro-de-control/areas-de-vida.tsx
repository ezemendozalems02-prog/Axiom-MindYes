import {
  Briefcase,
  Wallet,
  HeartPulse,
  GraduationCap,
  Users,
  Palette,
  ListTree,
  Compass,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

import type { AreaVida, Tendencia } from "@/types/centro-de-control";
import { cn } from "@/lib/utils";

const ICONOS: Record<string, typeof Briefcase> = {
  negocio: Briefcase,
  finanzas: Wallet,
  salud: HeartPulse,
  aprendizaje: GraduationCap,
  relaciones: Users,
  creatividad: Palette,
  organizacion: ListTree,
  proposito: Compass,
};

const TENDENCIA_ICONO: Record<Tendencia, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

const TENDENCIA_COLOR: Record<Tendencia, string> = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-text-muted",
};

export function AreasDeVida({ areas }: { areas: AreaVida[] }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-xl font-medium text-foreground">
        Estado de las áreas de vida
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {areas.map((area) => {
          const Icon = ICONOS[area.id] ?? Compass;
          const TendenciaIcon = TENDENCIA_ICONO[area.tendencia];
          return (
            <div
              key={area.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground">
                  <Icon className="size-4 text-text-secondary" />
                  <span className="text-sm font-medium">{area.nombre}</span>
                </div>
                <TendenciaIcon
                  className={cn("size-3.5", TENDENCIA_COLOR[area.tendencia])}
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-foreground">
                  {area.indice}
                </span>
                <span className="text-xs text-text-muted">/100</span>
              </div>
              <p className="text-xs leading-snug text-text-secondary">
                {area.observacion}
              </p>
              <span className="text-xs text-text-muted">
                Actualizado: {area.actualizado}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
