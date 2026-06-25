"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { useFinanzasStore } from "@/stores/finanzas-store";
import { getHoyISO } from "@/lib/hoy";
import {
  flujoProyectado30Dias,
  gastosPorCategoria,
  mesAnterior,
  mesDe,
  sumarGastosDelMes,
  sumarIngresosDelMes,
} from "@/lib/finanzas";
import { FormDialog, type CampoForm } from "@/components/ui/form-dialog";

const CAMPOS_PATRIMONIO: CampoForm[] = [
  { key: "activos", label: "Activos (USD)", type: "number" },
  { key: "deudas", label: "Deudas (USD)", type: "number" },
];

const COLORES_DONUT = [
  "var(--color-primary)",
  "var(--color-warning)",
  "var(--color-success)",
  "var(--color-destructive)",
  "var(--color-text-muted)",
];

export default function DashboardFinancieroPage() {
  const ingresos = useFinanzasStore((s) => s.ingresos);
  const gastos = useFinanzasStore((s) => s.gastos);
  const objetivos = useFinanzasStore((s) => s.objetivos);
  const patrimonio = useFinanzasStore((s) => s.patrimonio);
  const actualizarPatrimonio = useFinanzasStore((s) => s.actualizarPatrimonio);
  const [dialogPatrimonioAbierto, setDialogPatrimonioAbierto] = useState(false);

  const mesActual = mesDe(getHoyISO());
  const mesPrevio = mesAnterior(mesActual);

  const ingresosMesActual = sumarIngresosDelMes(ingresos, mesActual);
  const ingresosMesPrevio = sumarIngresosDelMes(ingresos, mesPrevio);
  const gastosMesActual = sumarGastosDelMes(gastos, mesActual);
  const ahorroMes = Math.max(0, ingresosMesActual - gastosMesActual);

  const datosBarras = [
    { mes: "Mes anterior", monto: ingresosMesPrevio },
    { mes: "Este mes", monto: ingresosMesActual },
  ];

  const categorias = gastosPorCategoria(gastos, mesActual);
  const top3 = categorias.slice(0, 3);

  const flujo30 = flujoProyectado30Dias(ingresos, gastos);
  const patrimonioNeto = patrimonio.activos - patrimonio.deudas;
  const pctAhorro =
    objetivos.ahorroMensualTarget > 0
      ? Math.min(100, Math.round((ahorroMes / objetivos.ahorroMensualTarget) * 100))
      : 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard Financiero</h1>
        <p className="text-sm text-text-secondary">Tu realidad económica, de un vistazo.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
          <span className="text-xs text-text-muted uppercase tracking-wide">
            Flujo proyectado (30 días)
          </span>
          <span
            className={`text-2xl font-semibold ${flujo30 >= 0 ? "text-success" : "text-destructive"}`}
          >
            ${flujo30.toLocaleString("es-AR")}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted uppercase tracking-wide">
              Patrimonio neto
            </span>
            <button
              onClick={() => setDialogPatrimonioAbierto(true)}
              className="text-text-muted hover:text-foreground"
              aria-label="Editar patrimonio"
            >
              <Pencil className="size-3" />
            </button>
          </div>
          <span className="text-2xl font-semibold text-foreground">
            ${patrimonioNeto.toLocaleString("es-AR")}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
          <span className="text-xs text-text-muted uppercase tracking-wide">
            Ahorro del mes
          </span>
          <span className="text-2xl font-semibold text-foreground">
            ${ahorroMes.toLocaleString("es-AR")}
          </span>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-success" style={{ width: `${pctAhorro}%` }} />
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
          <span className="text-xs text-text-muted uppercase tracking-wide">
            Fondo de emergencia
          </span>
          <span className="text-2xl font-semibold text-foreground">
            ${objetivos.fondoEmergenciaActual.toLocaleString("es-AR")}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
          <span className="text-sm font-medium text-foreground">
            Ingresos: este mes vs anterior
          </span>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosBarras}>
                <XAxis
                  dataKey="mes"
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => [
                    `$${Number(value ?? 0).toLocaleString("es-AR")}`,
                    "Ingresos",
                  ]}
                />
                <Bar dataKey="monto" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
          <span className="text-sm font-medium text-foreground">Gastos por categoría</span>
          <div className="flex items-center gap-4">
            <div className="h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorias}
                    dataKey="monto"
                    nameKey="categoria"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {categorias.map((_, i) => (
                      <Cell key={i} fill={COLORES_DONUT[i % COLORES_DONUT.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value) => [
                      `$${Number(value ?? 0).toLocaleString("es-AR")}`,
                      "",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-1.5">
              {top3.map((c, i) => (
                <div key={c.categoria} className="flex items-center gap-2 text-xs">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: COLORES_DONUT[i % COLORES_DONUT.length] }}
                  />
                  <span className="text-foreground">{c.categoria}</span>
                  <span className="text-text-muted">
                    ${c.monto.toLocaleString("es-AR")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FormDialog
        open={dialogPatrimonioAbierto}
        onOpenChange={setDialogPatrimonioAbierto}
        title="Editar patrimonio"
        campos={CAMPOS_PATRIMONIO}
        datosIniciales={patrimonio}
        onGuardar={(valores) =>
          actualizarPatrimonio({
            activos: Number(valores.activos) || 0,
            deudas: Number(valores.deudas) || 0,
          })
        }
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
