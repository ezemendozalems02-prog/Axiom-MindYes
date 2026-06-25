"use client";

import { useDireccionStore } from "@/stores/direccion-store";
import { planAnual } from "@/lib/mock/direccion";
import { getHoyISO } from "@/lib/hoy";

const NOMBRES_MES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const CARGA_COLOR: Record<string, string> = {
  Baja: "bg-success/15 text-success",
  Media: "bg-warning/15 text-warning",
  Alta: "bg-destructive/15 text-destructive",
};

export default function PlanAnualPage() {
  const objetivos = useDireccionStore((s) => s.objetivos);
  const mesActual = Number(getHoyISO().slice(5, 7));

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Plan Anual {planAnual.anio}</h1>
        <div className="flex gap-3 text-xs text-text-muted">
          {["Q1", "Q2", "Q3", "Q4"].map((q) => (
            <span key={q} className="rounded-full border border-border px-2.5 py-1">
              Revisión {q}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {planAnual.meses.map((m) => {
          const objetivosDelMes = objetivos.filter((o) => m.objetivosIds.includes(o.id));
          const esActual = m.mes === mesActual;
          return (
            <div
              key={m.mes}
              className={`flex flex-col gap-2 rounded-lg border p-4 ${
                esActual ? "border-primary/50 bg-primary/5" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{NOMBRES_MES[m.mes - 1]}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CARGA_COLOR[m.cargaEstimada]}`}>
                  {m.cargaEstimada}
                </span>
              </div>

              {objetivosDelMes.length > 0 && (
                <div className="flex flex-col gap-1">
                  {objetivosDelMes.map((o) => (
                    <span key={o.id} className="text-xs text-text-secondary">
                      · {o.titulo}
                    </span>
                  ))}
                </div>
              )}

              {m.hitos.length > 0 && (
                <div className="flex flex-col gap-1">
                  {m.hitos.map((h) => (
                    <span key={h} className="text-xs text-primary">
                      ★ {h}
                    </span>
                  ))}
                </div>
              )}

              {m.proyectosPlanificados.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {m.proyectosPlanificados.map((p) => (
                    <span key={p} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {objetivosDelMes.length === 0 && m.hitos.length === 0 && m.proyectosPlanificados.length === 0 && (
                <span className="text-xs text-text-muted">Sin planificar.</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Eventos clave del año</span>
        <div className="flex flex-wrap gap-2">
          {planAnual.eventosClave.map((e) => (
            <span key={e.id} className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground">
              {e.titulo} · {e.fecha}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
