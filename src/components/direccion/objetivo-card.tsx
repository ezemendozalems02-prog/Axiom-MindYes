import Link from "next/link";

import type { Meta, Objetivo } from "@/types/direccion";
import { Badge } from "@/components/ui/badge";
import { calcularProgresoObjetivo } from "@/lib/direccion";

const ESTADO_VARIANT: Record<Objetivo["estado"], "default" | "secondary" | "outline" | "destructive"> = {
  Activo: "default",
  Cumplido: "secondary",
  Pospuesto: "outline",
  Abandonado: "destructive",
};

export function ObjetivoCard({
  objetivo,
  objetivos,
  metas = [],
  compacto = false,
}: {
  objetivo: Objetivo;
  objetivos: Objetivo[];
  metas?: Meta[];
  compacto?: boolean;
}) {
  const progreso = calcularProgresoObjetivo(objetivo.id, objetivos, metas);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {objetivo.nivel}
          </Badge>
          <span className="text-xs text-text-muted">{objetivo.area}</span>
        </div>
        <Badge variant={ESTADO_VARIANT[objetivo.estado]} className="text-[10px]">
          {objetivo.estado}
        </Badge>
      </div>
      <Link
        href={`/direccion/objetivos/${objetivo.id}`}
        className="text-sm font-medium text-foreground hover:underline"
      >
        {objetivo.titulo}
      </Link>
      {!compacto && objetivo.descripcion && (
        <p className="text-xs text-text-secondary">{objetivo.descripcion}</p>
      )}
      <div className="mt-1 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progreso}%` }} />
        </div>
        <span className="text-xs text-text-muted">{progreso}%</span>
      </div>
    </div>
  );
}
