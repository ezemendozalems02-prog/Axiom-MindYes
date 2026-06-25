"use client";

import { useMemo, useState } from "react";

import { NIVELES_OBJETIVO, type EstadoObjetivo, type NivelObjetivo } from "@/types/direccion";
import { useDireccionStore } from "@/stores/direccion-store";
import { raicesDe, calcularProgresoObjetivo } from "@/lib/direccion";
import { areasDeVida } from "@/lib/mock/centro-de-control";
import { ObjetivoCard } from "@/components/direccion/objetivo-card";
import { ObjetivoNodo } from "@/components/direccion/objetivo-nodo";
import { IndicadoresDireccion } from "@/components/direccion/indicadores-direccion";

const VISTAS = ["Árbol", "Lista", "Timeline", "Por Área"] as const;

export default function ObjetivosPage() {
  const objetivos = useDireccionStore((s) => s.objetivos);
  const [vista, setVista] = useState<(typeof VISTAS)[number]>("Árbol");
  const [filtroNivel, setFiltroNivel] = useState<NivelObjetivo | "Todos">("Todos");
  const [filtroArea, setFiltroArea] = useState<string>("Todas");
  const [filtroEstado, setFiltroEstado] = useState<EstadoObjetivo | "Todos">("Todos");
  const [orden, setOrden] = useState<"progreso" | "fecha">("progreso");

  const areas = useMemo(() => Array.from(new Set(objetivos.map((o) => o.area))), [objetivos]);

  const filtrados = useMemo(() => {
    let r = objetivos;
    if (filtroNivel !== "Todos") r = r.filter((o) => o.nivel === filtroNivel);
    if (filtroArea !== "Todas") r = r.filter((o) => o.area === filtroArea);
    if (filtroEstado !== "Todos") r = r.filter((o) => o.estado === filtroEstado);
    return [...r].sort((a, b) => {
      if (orden === "progreso") {
        return calcularProgresoObjetivo(b.id, objetivos) - calcularProgresoObjetivo(a.id, objetivos);
      }
      return (a.fechaLimite ?? "9999").localeCompare(b.fechaLimite ?? "9999");
    });
  }, [objetivos, filtroNivel, filtroArea, filtroEstado, orden]);

  const raices = raicesDe(objetivos);

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <IndicadoresDireccion />

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Sistema de Objetivos</h1>
        <div className="flex gap-1 rounded-lg border border-border bg-popover/40 p-1">
          {VISTAS.map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                vista === v ? "bg-primary text-primary-foreground" : "text-text-secondary hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {vista === "Árbol" && (
        <div className="flex flex-col gap-4">
          {raices.map((r) => (
            <ObjetivoNodo key={r.id} objetivo={r} objetivos={objetivos} />
          ))}
        </div>
      )}

      {vista === "Lista" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value as NivelObjetivo | "Todos")}
              className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-sm text-foreground"
            >
              <option value="Todos">Todos los niveles</option>
              {NIVELES_OBJETIVO.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <select
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
              className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-sm text-foreground"
            >
              <option value="Todas">Todas las áreas</option>
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoObjetivo | "Todos")}
              className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-sm text-foreground"
            >
              <option value="Todos">Todos los estados</option>
              {(["Activo", "Cumplido", "Pospuesto", "Abandonado"] as EstadoObjetivo[]).map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as "progreso" | "fecha")}
              className="ml-auto rounded-md border border-border bg-popover px-2.5 py-1.5 text-sm text-foreground"
            >
              <option value="progreso">Ordenar por progreso</option>
              <option value="fecha">Ordenar por fecha límite</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filtrados.map((o) => (
              <ObjetivoCard key={o.id} objetivo={o} objetivos={objetivos} />
            ))}
            {filtrados.length === 0 && (
              <p className="col-span-2 text-sm text-text-muted">Sin objetivos para estos filtros.</p>
            )}
          </div>
        </div>
      )}

      {vista === "Timeline" && (
        <div className="flex flex-col gap-3 overflow-x-auto">
          {(["Anual", "Trimestral"] as NivelObjetivo[]).map((nivel) => (
            <div key={nivel} className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{nivel}</span>
              <div className="flex gap-3">
                {objetivos
                  .filter((o) => o.nivel === nivel)
                  .map((o) => (
                    <div key={o.id} className="w-64 shrink-0">
                      <ObjetivoCard objetivo={o} objetivos={objetivos} compacto />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {vista === "Por Área" && (
        <div className="grid grid-cols-2 gap-4">
          {areasDeVida.map(({ nombre: area }) => {
            const deArea = objetivos.filter((o) => o.area === area);
            return (
              <div key={area} className="flex flex-col gap-2 rounded-lg border border-border bg-popover/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{area}</span>
                  <span className="text-xs text-text-muted">{deArea.length} objetivo(s)</span>
                </div>
                {deArea.length === 0 ? (
                  <p className="text-xs text-text-muted">Sin objetivos definidos en esta área — posible desequilibrio.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {deArea.map((o) => (
                      <ObjetivoCard key={o.id} objetivo={o} objetivos={objetivos} compacto />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
