"use client";

import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";

import type { Meta } from "@/types/direccion";
import { useDireccionStore } from "@/stores/direccion-store";
import { calcularTendenciaMeta } from "@/lib/direccion";
import { Button } from "@/components/ui/button";
import { FormDialog, type CampoForm } from "@/components/ui/form-dialog";
import { getHoyISO } from "@/lib/hoy";

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

const CAMPOS_META: CampoForm[] = [
  { key: "nombre", label: "Nombre", type: "text", placeholder: "Ej: Ahorrar USD 500/mes" },
  { key: "area", label: "Área de vida", type: "text" },
  { key: "valorObjetivo", label: "Valor objetivo", type: "number" },
  { key: "unidad", label: "Unidad", type: "text", placeholder: "USD, veces/semana, libros…" },
  { key: "frecuencia", label: "Frecuencia de medición", type: "select", opciones: ["diaria", "semanal", "mensual"] },
];

export default function MetasPage() {
  const metas = useDireccionStore((s) => s.metas);
  const agregarMeta = useDireccionStore((s) => s.agregarMeta);
  const registrarValorMeta = useDireccionStore((s) => s.registrarValorMeta);

  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [registrandoId, setRegistrandoId] = useState<string | null>(null);
  const [nuevoValor, setNuevoValor] = useState("");

  function guardarMeta(valores: Record<string, unknown>) {
    agregarMeta({
      id: crypto.randomUUID(),
      nombre: String(valores.nombre),
      objetivoId: null,
      area: String(valores.area),
      valorActual: 0,
      valorObjetivo: Number(valores.valorObjetivo) || 0,
      unidad: String(valores.unidad),
      frecuencia: valores.frecuencia as Meta["frecuencia"],
      historial: [],
      fuente: "manual",
    });
  }

  function registrarValor(id: string) {
    const v = Number(nuevoValor);
    if (Number.isNaN(v)) return;
    registrarValorMeta(id, v, getHoyISO());
    setRegistrandoId(null);
    setNuevoValor("");
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Metas Cuantificables</h1>
        <Button size="sm" onClick={() => setDialogAbierto(true)}>
          <Plus data-icon="inline-start" />
          Nueva Meta
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Medición {meta.frecuencia}</span>
                {registrandoId === meta.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      autoFocus
                      type="number"
                      value={nuevoValor}
                      onChange={(e) => setNuevoValor(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && registrarValor(meta.id)}
                      className="h-7 w-20 rounded-md border border-border bg-popover px-2 text-xs text-foreground"
                    />
                    <Button size="sm" onClick={() => registrarValor(meta.id)}>
                      Guardar
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setRegistrandoId(meta.id)}>
                    Registrar valor
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <FormDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        title="Nueva meta"
        campos={CAMPOS_META}
        onGuardar={guardarMeta}
        submitLabel="Crear meta"
      />
    </div>
  );
}
