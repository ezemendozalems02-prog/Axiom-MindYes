"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { useDireccionStore } from "@/stores/direccion-store";
import { calcularTendenciaMeta } from "@/lib/direccion";

const ICONO_TENDENCIA = {
  up: <TrendingUp className="size-3.5 text-success" />,
  down: <TrendingDown className="size-3.5 text-destructive" />,
  flat: <Minus className="size-3.5 text-text-muted" />,
};

const FUENTE_LABEL: Record<string, string> = {
  finanzas: "Sincronizada con Finanzas",
  identidad: "Sincronizada con Identidad",
  accion: "Sincronizada con Acción",
  manual: "Manual",
};

export default function MetasPage() {
  const metas = useDireccionStore((s) => s.metas);

  return (
    <div className="grid grid-cols-2 gap-4 px-8 py-8">
      {metas.map((meta) => {
        const tendencia = calcularTendenciaMeta(meta);
        const pct = Math.min(100, Math.round((meta.valorActual / meta.valorObjetivo) * 100));
        return (
          <div key={meta.id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{meta.nombre}</span>
                <span className="text-xs text-text-muted">{meta.area} · {FUENTE_LABEL[meta.fuente]}</span>
              </div>
              {ICONO_TENDENCIA[tendencia]}
            </div>

            <div className="flex items-end gap-2">
              <span className="text-2xl font-semibold text-foreground">
                {meta.valorActual.toLocaleString("es-AR")}
              </span>
              <span className="pb-0.5 text-sm text-text-muted">
                / {meta.valorObjetivo.toLocaleString("es-AR")} {meta.unidad}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>

            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={meta.historial}>
                  <XAxis dataKey="fecha" hide />
                  <Tooltip
                    formatter={(value) => [String(value ?? 0), meta.unidad]}
                    labelFormatter={(label) => String(label)}
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <span className="text-xs text-text-muted">Medición {meta.frecuencia}</span>
          </div>
        );
      })}
    </div>
  );
}
