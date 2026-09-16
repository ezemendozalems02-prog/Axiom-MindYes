"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import type { EstadoIngreso, Ingreso } from "@/types/finanzas";
import { useFinanzasStore } from "@/stores/finanzas-store";
import { useNegocioStore } from "@/stores/negocio-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHoyISO } from "@/lib/hoy";
import { formatMonto } from "@/lib/finanzas";

const ESTADO_COLOR: Record<EstadoIngreso, string> = {
  Confirmado: "bg-primary/15 text-primary",
  Pendiente: "bg-warning/15 text-warning",
  Cobrado: "bg-success/15 text-success",
};

export default function IngresosPage() {
  const ingresos = useFinanzasStore((s) => s.ingresos);
  const agregarIngreso = useFinanzasStore((s) => s.agregarIngreso);
  const clientes = useNegocioStore((s) => s.clientes);
  const monedaVisualizacion = useFinanzasStore((s) => s.monedaVisualizacion);
  const fm = (monto: number) => formatMonto(monto, monedaVisualizacion);

  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("Honorarios");
  const [clienteId, setClienteId] = useState("");

  const ordenados = [...ingresos].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const total = ingresos
    .filter((i) => i.estado !== "Pendiente")
    .reduce((acc, i) => acc + i.monto, 0);

  function registrar() {
    const valor = Number(monto);
    if (!valor || valor <= 0) return;
    const nuevo: Ingreso = {
      id: crypto.randomUUID(),
      fecha: getHoyISO(),
      monto: valor,
      moneda: monedaVisualizacion,
      clienteId: clienteId || null,
      proyectoId: null,
      categoria,
      recurrente: false,
      estado: "Confirmado",
    };
    agregarIngreso(nuevo);
    setMonto("");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Ingresos</h1>
        <p className="text-sm text-text-secondary">
          Total confirmado/cobrado: {fm(total)}
        </p>
      </div>

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
          <label className="text-xs text-text-muted">Cliente</label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-popover px-2 text-sm text-foreground sm:h-8 sm:w-40"
          >
            <option value="">Sin cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <Button size="sm" onClick={registrar} className="w-full sm:w-auto">
          <Plus data-icon="inline-start" />
          Registrar
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {ordenados.map((i) => {
          const cliente = clientes.find((c) => c.id === i.clienteId);
          return (
            <div
              key={i.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-card px-4 py-3"
            >
              <span className="w-20 shrink-0 text-xs text-text-muted sm:w-24">{i.fecha}</span>
              <span className="order-last min-w-0 basis-full truncate text-sm text-foreground sm:order-none sm:flex-1 sm:basis-auto">
                {i.categoria}
                {cliente && ` · ${cliente.nombre}`}
                {i.recurrente && " · recurrente"}
              </span>
              <Badge className={ESTADO_COLOR[i.estado]}>{i.estado}</Badge>
              <span className="ml-auto shrink-0 text-right text-sm font-medium text-foreground sm:ml-0 sm:w-20">
                {fm(i.monto)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
