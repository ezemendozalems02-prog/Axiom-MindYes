"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useDireccionStore } from "@/stores/direccion-store";
import { useAccionStore } from "@/stores/accion-store";
import { useIdentidadStore } from "@/stores/identidad-store";
import { calcularProgresoObjetivo, hijosDe } from "@/lib/direccion";
import { calcularProgresoProyecto } from "@/lib/accion-format";
import { ObjetivoCard } from "@/components/direccion/objetivo-card";
import { Badge } from "@/components/ui/badge";

export default function ObjetivoDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const objetivos = useDireccionStore((s) => s.objetivos);
  const actualizarObjetivo = useDireccionStore((s) => s.actualizarObjetivo);
  const proyectos = useAccionStore((s) => s.proyectos);
  const tareas = useAccionStore((s) => s.tareas);
  const habitos = useIdentidadStore((s) => s.habitos);

  const objetivo = objetivos.find((o) => o.id === params.id);
  if (!objetivo) {
    return <div className="px-8 py-10 text-sm text-text-secondary">Objetivo no encontrado.</div>;
  }

  const padre = objetivos.find((o) => o.id === objetivo.objetivoPadreId);
  const hijos = hijosDe(objetivo.id, objetivos);
  const progreso = calcularProgresoObjetivo(objetivo.id, objetivos);
  const proyectosRelacionados = proyectos.filter((p) => objetivo.proyectosIds.includes(p.id));
  const habitosRelacionados = habitos.filter((h) => objetivo.habitosIds.includes(h.id));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-8 py-10">
      <button
        onClick={() => router.push("/direccion/objetivos")}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Objetivos
      </button>

      {padre && (
        <Link
          href={`/direccion/objetivos/${padre.id}`}
          className="text-xs text-text-muted hover:text-foreground"
        >
          Contribuye a: {padre.titulo}
        </Link>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{objetivo.nivel}</Badge>
          <Badge variant="secondary">{objetivo.area}</Badge>
        </div>
        <h1 className="text-2xl font-semibold text-foreground">{objetivo.titulo}</h1>
        <p className="text-sm text-text-secondary">{objetivo.descripcion}</p>
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progreso}%` }} />
          </div>
          <span className="text-xs text-text-muted">{progreso}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
          <span className="text-xs uppercase tracking-wide text-text-muted">Motivación</span>
          <p className="text-sm text-foreground">{objetivo.motivacion || "—"}</p>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
          <span className="text-xs uppercase tracking-wide text-text-muted">Estado</span>
          <select
            value={objetivo.estado}
            onChange={(e) => actualizarObjetivo(objetivo.id, { estado: e.target.value as typeof objetivo.estado })}
            className="rounded-md border border-border bg-popover px-2 py-1 text-sm text-foreground"
          >
            {(["Activo", "Cumplido", "Pospuesto", "Abandonado"] as const).map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
          <span className="text-xs uppercase tracking-wide text-text-muted">Métricas de éxito</span>
          {objetivo.metricasExito.length ? (
            <ul className="list-inside list-disc text-sm text-foreground">
              {objetivo.metricasExito.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">Sin métricas definidas.</p>
          )}
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
          <span className="text-xs uppercase tracking-wide text-text-muted">Obstáculos anticipados</span>
          {objetivo.obstaculos.length ? (
            <ul className="list-inside list-disc text-sm text-foreground">
              {objetivo.obstaculos.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">Ninguno registrado.</p>
          )}
        </div>
      </div>

      {proyectosRelacionados.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Proyectos relacionados</span>
          {proyectosRelacionados.map((p) => (
            <Link
              key={p.id}
              href={p.area === "Negocio" ? `/negocio/proyectos/${p.id}` : `/accion/proyectos/${p.id}`}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm hover:border-primary/40"
            >
              <span className="text-foreground">{p.nombre}</span>
              <span className="text-text-muted">{calcularProgresoProyecto(p.id, tareas)}%</span>
            </Link>
          ))}
        </div>
      )}

      {habitosRelacionados.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Hábitos que lo impulsan</span>
          {habitosRelacionados.map((h) => (
            <Link
              key={h.id}
              href="/identidad/habitos"
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm hover:border-primary/40"
            >
              <span className="text-foreground">{h.nombre}</span>
              <span className="text-text-muted">{h.area}</span>
            </Link>
          ))}
        </div>
      )}

      {hijos.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Se descompone en</span>
          {hijos.map((h) => (
            <ObjetivoCard key={h.id} objetivo={h} objetivos={objetivos} compacto />
          ))}
        </div>
      )}
    </div>
  );
}
