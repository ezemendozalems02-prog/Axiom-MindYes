"use client";

import { useEffect, useState } from "react";

import { crearClienteSupabaseBrowser } from "@/lib/supabase/client";

type Metricas = {
  totalUsuarios: number;
  enTrial: number;
  trialVencido: number;
  nuevosUltimos7Dias: number;
  totalProyectos: number;
  totalTareas: number;
};

function Tarjeta({ titulo, valor }: { titulo: string; valor: number | string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5">
      <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{titulo}</span>
      <span className="text-2xl font-semibold text-foreground">{valor}</span>
    </div>
  );
}

export default function SuperadminDashboardPage() {
  const [m, setM] = useState<Metricas | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const supabase = crearClienteSupabaseBrowser();
      const ahora = new Date();
      const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [{ data: perfiles }, { count: totalProyectos }, { count: totalTareas }] = await Promise.all([
        supabase.from("profiles").select("id, role, trial_ends_at, created_at"),
        supabase.from("proyectos").select("id", { count: "exact", head: true }),
        supabase.from("tareas").select("id", { count: "exact", head: true }),
      ]);

      const lista = perfiles ?? [];
      const enTrial = lista.filter((p) => p.trial_ends_at && new Date(p.trial_ends_at) > ahora).length;
      const trialVencido = lista.filter((p) => p.trial_ends_at && new Date(p.trial_ends_at) <= ahora).length;
      const nuevosUltimos7Dias = lista.filter((p) => p.created_at >= hace7Dias).length;

      setM({
        totalUsuarios: lista.length,
        enTrial,
        trialVencido,
        nuevosUltimos7Dias,
        totalProyectos: totalProyectos ?? 0,
        totalTareas: totalTareas ?? 0,
      });
      setCargando(false);
    }
    cargar();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-text-muted">Métricas en tiempo real desde Supabase.</p>
      </div>

      {cargando || !m ? (
        <p className="text-sm text-text-muted">Cargando…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Tarjeta titulo="Usuarios totales" valor={m.totalUsuarios} />
          <Tarjeta titulo="Nuevos (7 días)" valor={m.nuevosUltimos7Dias} />
          <Tarjeta titulo="En trial activo" valor={m.enTrial} />
          <Tarjeta titulo="Trial vencido" valor={m.trialVencido} />
          <Tarjeta titulo="Proyectos (Acción)" valor={m.totalProyectos} />
          <Tarjeta titulo="Tareas (Acción)" valor={m.totalTareas} />
        </div>
      )}
    </div>
  );
}
