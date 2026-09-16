"use client";

import { useState } from "react";
import { AlertTriangle, Pencil, Plus, TrendingDown, TrendingUp } from "lucide-react";

import type { Gasto, Moneda, TipoGasto } from "@/types/finanzas";
import { useFinanzasStore } from "@/stores/finanzas-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHoyISO } from "@/lib/hoy";
import {
  diasEnMes,
  formatMonto,
  gastosPorCategoria,
  gastosPorTipo,
  mesAnterior,
  mesDe,
  sumarGastosDelMes,
} from "@/lib/finanzas";
import { FormDialog, type CampoForm } from "@/components/ui/form-dialog";

const COLORES_CATEGORIA = [
  "var(--color-primary)",
  "var(--color-warning)",
  "var(--color-success)",
  "var(--color-destructive)",
  "var(--color-text-muted)",
];

function camposGasto(moneda: Moneda): CampoForm[] {
  return [
    { key: "fecha", label: "Fecha", type: "date" },
    { key: "monto", label: `Monto (${moneda})`, type: "number" },
    { key: "categoria", label: "Categoría", type: "text" },
    { key: "tipo", label: "Tipo", type: "select", opciones: ["Fijo", "Variable"] },
  ];
}

function camposPresupuesto(moneda: Moneda): CampoForm[] {
  return [{ key: "presupuestoMensualGastos", label: `Presupuesto mensual (${moneda})`, type: "number" }];
}

export default function GastosPage() {
  const gastos = useFinanzasStore((s) => s.gastos);
  const agregarGasto = useFinanzasStore((s) => s.agregarGasto);
  const editarGasto = useFinanzasStore((s) => s.editarGasto);
  const eliminarGasto = useFinanzasStore((s) => s.eliminarGasto);
  const objetivos = useFinanzasStore((s) => s.objetivos);
  const actualizarObjetivos = useFinanzasStore((s) => s.actualizarObjetivos);
  const monedaVisualizacion = useFinanzasStore((s) => s.monedaVisualizacion);
  const fm = (monto: number) => formatMonto(monto, monedaVisualizacion);

  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("Variable");
  const [tipo, setTipo] = useState<TipoGasto>("Variable");
  const [gastoEditando, setGastoEditando] = useState<Gasto | null>(null);
  const [dialogPresupuestoAbierto, setDialogPresupuestoAbierto] = useState(false);

  const hoy = getHoyISO();
  const mesActual = mesDe(hoy);
  const mesPrevio = mesAnterior(mesActual);
  const totalMes = sumarGastosDelMes(gastos, mesActual);
  const totalMesPrevio = sumarGastosDelMes(gastos, mesPrevio);
  const presupuesto = objetivos.presupuestoMensualGastos;
  const superaPresupuesto = presupuesto > 0 && totalMes > presupuesto;
  const pctPresupuesto = presupuesto > 0 ? Math.min(100, Math.round((totalMes / presupuesto) * 100)) : 0;
  const restante = Math.max(0, presupuesto - totalMes);

  const diaActual = Number(hoy.slice(8, 10));
  const totalDiasMes = diasEnMes(mesActual);
  const promedioDiario = diaActual > 0 ? totalMes / diaActual : 0;
  const proyeccionFinMes = promedioDiario * totalDiasMes;
  const superaProyeccion = presupuesto > 0 && proyeccionFinMes > presupuesto;

  const deltaVsMesPrevio =
    totalMesPrevio > 0 ? Math.round(((totalMes - totalMesPrevio) / totalMesPrevio) * 100) : null;

  const categorias = gastosPorCategoria(gastos, mesActual);
  const maxCategoria = categorias[0]?.monto ?? 0;
  const { fijo, variable } = gastosPorTipo(gastos, mesActual);
  const pctFijo = totalMes > 0 ? Math.round((fijo / totalMes) * 100) : 0;
  const pctVariable = totalMes > 0 ? Math.round((variable / totalMes) * 100) : 0;

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
        <p className="text-sm text-text-secondary">Controlá tu gasto mensual y en qué se te va la plata.</p>
      </div>

      {superaPresupuesto && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="size-3.5" />
          Superaste tu presupuesto mensual de gastos.
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Presupuesto mensual</span>
          <button
            onClick={() => setDialogPresupuestoAbierto(true)}
            className="text-text-muted hover:text-foreground"
            aria-label="Editar presupuesto mensual"
          >
            <Pencil className="size-3.5" />
          </button>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-sm">
          <span className={superaPresupuesto ? "font-semibold text-destructive" : "font-semibold text-foreground"}>
            {fm(totalMes)}
          </span>
          <span className="text-text-muted">
            de {fm(presupuesto)} · {pctPresupuesto}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full ${
              superaPresupuesto ? "bg-destructive" : pctPresupuesto >= 80 ? "bg-warning" : "bg-success"
            }`}
            style={{ width: `${pctPresupuesto}%` }}
          />
        </div>
        <span className="text-xs text-text-muted">
          {presupuesto <= 0
            ? "Definí un presupuesto para hacer seguimiento."
            : superaPresupuesto
              ? `Te pasaste por ${fm(totalMes - presupuesto)}`
              : `Te quedan ${fm(restante)} disponibles este mes`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3">
          <span className="text-xs text-text-muted uppercase tracking-wide">Promedio diario</span>
          <span className="text-lg font-semibold text-foreground">{fm(promedioDiario)}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3">
          <span className="text-xs text-text-muted uppercase tracking-wide">Proyección fin de mes</span>
          <span className={`text-lg font-semibold ${superaProyeccion ? "text-destructive" : "text-foreground"}`}>
            {fm(proyeccionFinMes)}
          </span>
        </div>
        <div className="col-span-2 flex flex-col gap-1 rounded-lg border border-border bg-card p-3 sm:col-span-1">
          <span className="text-xs text-text-muted uppercase tracking-wide">Vs. mes anterior</span>
          {deltaVsMesPrevio === null ? (
            <span className="text-lg font-semibold text-foreground">—</span>
          ) : (
            <span
              className={`flex items-center gap-1 text-lg font-semibold ${
                deltaVsMesPrevio > 0 ? "text-destructive" : "text-success"
              }`}
            >
              {deltaVsMesPrevio > 0 ? (
                <TrendingUp className="size-4" />
              ) : (
                <TrendingDown className="size-4" />
              )}
              {Math.abs(deltaVsMesPrevio)}%
            </span>
          )}
        </div>
      </div>

      {categorias.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
            <span className="text-sm font-medium text-foreground">Por categoría</span>
            <div className="flex flex-col gap-2.5">
              {categorias.slice(0, 5).map((c, i) => (
                <div key={c.categoria} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate text-text-secondary">{c.categoria}</span>
                    <span className="shrink-0 text-foreground">{fm(c.monto)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${maxCategoria > 0 ? Math.round((c.monto / maxCategoria) * 100) : 0}%`,
                        background: COLORES_CATEGORIA[i % COLORES_CATEGORIA.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
            <span className="text-sm font-medium text-foreground">Fijo vs. variable</span>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Fijo</span>
                  <span className="text-foreground">
                    {fm(fijo)} · {pctFijo}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pctFijo}%` }} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Variable</span>
                  <span className="text-foreground">
                    {fm(variable)} · {pctVariable}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-warning" style={{ width: `${pctVariable}%` }} />
                </div>
              </div>
            </div>
          </div>
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
            <button
              onClick={() => setGastoEditando(g)}
              className="shrink-0 text-text-muted hover:text-foreground"
              aria-label="Editar gasto"
            >
              <Pencil className="size-3.5" />
            </button>
          </div>
        ))}
      </div>

      <FormDialog
        open={gastoEditando !== null}
        onOpenChange={(v) => { if (!v) setGastoEditando(null); }}
        title="Editar gasto"
        campos={camposGasto(monedaVisualizacion)}
        datosIniciales={gastoEditando ?? undefined}
        onGuardar={(valores) => {
          if (!gastoEditando) return;
          editarGasto(gastoEditando.id, {
            fecha: String(valores.fecha) || gastoEditando.fecha,
            monto: Number(valores.monto) || 0,
            categoria: String(valores.categoria),
            tipo: valores.tipo as TipoGasto,
          });
        }}
        onEliminar={() => {
          if (gastoEditando) eliminarGasto(gastoEditando.id);
        }}
        submitLabel="Guardar cambios"
      />

      <FormDialog
        open={dialogPresupuestoAbierto}
        onOpenChange={setDialogPresupuestoAbierto}
        title="Editar presupuesto mensual"
        campos={camposPresupuesto(monedaVisualizacion)}
        datosIniciales={{ presupuestoMensualGastos: presupuesto }}
        onGuardar={(valores) =>
          actualizarObjetivos({ presupuestoMensualGastos: Number(valores.presupuestoMensualGastos) || 0 })
        }
        submitLabel="Guardar"
      />
    </div>
  );
}
