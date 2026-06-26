"use client";

import { useEffect, useState } from "react";

import { crearClienteSupabaseBrowser } from "@/lib/supabase/client";
import type { Plan } from "@/lib/supabase/tipos";

export default function SuperadminPlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [limiteProyectos, setLimiteProyectos] = useState("");
  const [limiteTareas, setLimiteTareas] = useState("");

  async function cargar() {
    const supabase = crearClienteSupabaseBrowser();
    const { data, error: err } = await supabase.from("plans").select("*").order("precio_mensual");
    if (err) setError(err.message);
    else setPlanes((data ?? []) as Plan[]);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crearPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    const supabase = crearClienteSupabaseBrowser();
    const { error: err } = await supabase.from("plans").insert({
      nombre: nombre.trim(),
      precio_mensual: Number(precio) || 0,
      limite_proyectos: limiteProyectos ? Number(limiteProyectos) : null,
      limite_tareas: limiteTareas ? Number(limiteTareas) : null,
    });
    if (err) setError(err.message);
    else {
      setNombre("");
      setPrecio("");
      setLimiteProyectos("");
      setLimiteTareas("");
      cargar();
    }
  }

  async function toggleActivo(plan: Plan) {
    const supabase = crearClienteSupabaseBrowser();
    const { error: err } = await supabase.from("plans").update({ activo: !plan.activo }).eq("id", plan.id);
    if (err) setError(err.message);
    else cargar();
  }

  async function eliminarPlan(id: string) {
    const supabase = crearClienteSupabaseBrowser();
    const { error: err } = await supabase.from("plans").delete().eq("id", id);
    if (err) setError(err.message);
    else cargar();
  }

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Planes</h1>
        <p className="text-sm text-text-muted">Definí los planes y límites del producto.</p>
      </div>

      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}

      <form onSubmit={crearPlan} className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="rounded border border-border bg-popover px-2 py-1.5 text-sm" placeholder="Pro" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">Precio mensual (USD)</label>
          <input value={precio} onChange={(e) => setPrecio(e.target.value)} type="number" className="w-28 rounded border border-border bg-popover px-2 py-1.5 text-sm" placeholder="0" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">Límite proyectos</label>
          <input value={limiteProyectos} onChange={(e) => setLimiteProyectos(e.target.value)} type="number" className="w-32 rounded border border-border bg-popover px-2 py-1.5 text-sm" placeholder="vacío = sin límite" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">Límite tareas</label>
          <input value={limiteTareas} onChange={(e) => setLimiteTareas(e.target.value)} type="number" className="w-32 rounded border border-border bg-popover px-2 py-1.5 text-sm" placeholder="vacío = sin límite" />
        </div>
        <button type="submit" className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
          Crear plan
        </button>
      </form>

      {cargando ? (
        <p className="text-sm text-text-muted">Cargando…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {planes.length === 0 && <p className="text-sm text-text-muted">Sin planes todavía.</p>}
          {planes.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div>
                <p className="font-medium text-foreground">
                  {p.nombre} — ${p.precio_mensual}/mes
                  {!p.activo && <span className="ml-2 text-xs text-text-muted">(inactivo)</span>}
                </p>
                <p className="text-xs text-text-muted">
                  Proyectos: {p.limite_proyectos ?? "sin límite"} · Tareas: {p.limite_tareas ?? "sin límite"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActivo(p)} className="rounded border border-border px-2 py-1 text-xs text-text-secondary hover:text-foreground">
                  {p.activo ? "Desactivar" : "Activar"}
                </button>
                <button onClick={() => eliminarPlan(p.id)} className="rounded border border-border px-2 py-1 text-xs text-text-secondary hover:text-destructive">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
