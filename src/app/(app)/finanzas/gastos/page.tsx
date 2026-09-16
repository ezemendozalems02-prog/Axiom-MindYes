"use client";

import { useState } from "react";
import { Plus, AlertTriangle } from "lucide-react";

import type { Gasto, TipoGasto } from "@/types/finanzas";
import { useFinanzasStore } from "@/stores/finanzas-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHoyISO } from "@/lib/hoy";
import { formatMonto, mesDe, sumarGastosDelMes } from "@/lib/finanzas";

const PRESUPUESTO_MENSUAL = 1500;

export default function GastosPage() {
  const gastos = useFinanzasStore((s) => s.gastos);
  const agregarGasto = useFinanzasStore((s) => s.agregarGasto);
  const monedaVisualizacion = useFinanzasStore((s) => s.monedaVisualizacion);
  const fm = (monto: number) => formatMonto(monto, monedaVisualizacion);

  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("Variable");
  const [tipo, setTipo] = useState<TipoGasto>("Variable");

  const mesActual = mesDe(getHoyISO());
  const totalMes = sumarGastosDelMes(gastos, mesActual);
  const superaPresupuesto = totalMes > PRESUPUESTO_MENSUAL;
  const ordenados = [...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha));

  function registrar() {
    const valor = Number(monto);
    if (!valor || valor <= 0) return;
    const nuevo: Gasto = {
      id: crypto.randomUUID(),
      fecha: getHoyISO(),
      monto: valor,
      moneda: monedaVisualizacion,
      categoria,
      areaVida: "Organización",
      tipo,
    };
    agregarGasto(nuevo);
    setMonto("");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Gastos</h1>
        <p className="text-sm text-text-secondary">
          Total del mes: {fm(totalMes)} de {fm(PRESUPUESTO_MENSUAL)} presupuestados
        </p>
      </div>

      {superaPresupuesto && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="size-3.5" />
          Superaste tu presupuesto mensual de gastos.
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">Monto ({monedaVisualizacion})</label>
          <input
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            type="number"
            className="h-9 w-full rounded-md border border-border bg-popover px-2 text-sm text-foreground sm:h-8 sm:w-32"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">Categoría</label>
          <input
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-popover px-2 text-sm text-foreground sm:h-8 sm:w-36"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoGasto)}
            className="h-9 w-full rounded-md border border-border bg-popover px-2 text-sm text-foreground sm:h-8 sm:w-32"
          >
            <option value="Fijo">Fijo</option>
            <option value="Variable">Variable</option>
          </select>
        </div>
        <Button size="sm" onClick={registrar} className="w-full sm:w-auto">
          <Plus data-icon="inline-start" />
          Registrar
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {ordenados.map((g) => (
          <div
            key={g.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-card px-4 py-3"
          >
            <span className="w-20 shrink-0 text-xs text-text-muted sm:w-24">{g.fecha}</span>
            <span className="order-last min-w-0 basis-full truncate text-sm text-foreground sm:order-none sm:flex-1 sm:basis-auto">
              {g.categoria}
            </span>
            <Badge variant="secondary">{g.tipo}</Badge>
            <span className="ml-auto shrink-0 text-right text-sm font-medium text-foreground sm:ml-0 sm:w-20">
              {fm(g.monto)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
