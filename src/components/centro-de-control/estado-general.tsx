import { Battery, Crosshair, Scale, CloudFog } from "lucide-react";

import type { EstadoGeneral as EstadoGeneralType } from "@/types/centro-de-control";
import { cn } from "@/lib/utils";

const NIVELES_ENERGIA = ["Muy baja", "Baja", "Media", "Alta", "Excelente"];

function IndicadorEnergia({ nivel }: { nivel: string }) {
  const activos = NIVELES_ENERGIA.indexOf(nivel) + 1;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-text-secondary">
        <Battery className="size-3.5" />
        <span className="text-xs font-medium">Energía</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {NIVELES_ENERGIA.map((n, i) => (
            <span
              key={n}
              className={cn(
                "h-1.5 w-4 rounded-full",
                i < activos ? "bg-primary" : "bg-secondary"
              )}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-foreground">{nivel}</span>
      </div>
    </div>
  );
}

function IndicadorPorcentaje({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Crosshair;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-text-secondary">
        <Icon className="size-3.5" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-sm font-medium text-foreground">{value}</span>
      </div>
    </div>
  );
}

export function EstadoGeneral({
  saludo,
  nombre,
  fecha,
  frase,
  estado,
}: {
  saludo: string;
  nombre: string;
  fecha: string;
  frase: string;
  estado: EstadoGeneralType;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {saludo}, {nombre}
        </h1>
        <p className="text-sm text-text-secondary">{fecha}</p>
        <p className="text-base text-text-secondary">{frase}</p>
      </div>

      <div className="flex flex-wrap gap-x-10 gap-y-4 rounded-lg border border-border bg-card px-5 py-4">
        <IndicadorEnergia nivel={estado.energia} />
        <IndicadorPorcentaje icon={Crosshair} label="Foco" value={estado.foco} />
        <IndicadorPorcentaje
          icon={CloudFog}
          label="Carga mental"
          value={estado.cargaMental}
        />
        <IndicadorPorcentaje icon={Scale} label="Balance" value={estado.balance} />
      </div>
    </section>
  );
}
