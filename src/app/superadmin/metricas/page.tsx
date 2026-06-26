"use client";

import { useEffect, useState } from "react";

import { crearClienteSupabaseBrowser } from "@/lib/supabase/client";

type FilaUso = {
  userId: string;
  email: string;
  proyectos: number;
  tareas: number;
  tareasCompletadas: number;
};

export default function SuperadminMetricasPage() {
  const [filas, setFilas] = useState<FilaUso[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const supabase = crearClienteSupabaseBrowser();
      const [{ data: perfiles }, { data: proyectos }, { data: tareas }] = await Promise.all([
        supabase.from("profiles").select("id, email"),
        supabase.from("proyectos").select("id, user_id"),
        supabase.from("tareas").select("id, user_id, estado"),
      ]);

      const lista: FilaUso[] = (perfiles ?? []).map((p) => {
        const proyectosUsuario = (proyectos ?? []).filter((pr) => pr.user_id === p.id);
        const tareasUsuario = (tareas ?? []).filter((t) => t.user_id === p.id);
        return {
          userId: p.id,
          email: p.email,
          proyectos: proyectosUsuario.length,
          tareas: tareasUsuario.length,
          tareasCompletadas: tareasUsuario.filter((t) => t.estado === "completado").length,
        };
      });

      lista.sort((a, b) => b.tareas + b.proyectos - (a.tareas + a.proyectos));
      setFilas(lista);
      setCargando(false);
    }
    cargar();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Métricas de uso</h1>
        <p className="text-sm text-text-muted">
          Uso real del módulo Acción por usuario (único módulo migrado a Supabase por ahora).
        </p>
      </div>

      {cargando ? (
        <p className="text-sm text-text-muted">Cargando…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card text-left text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Proyectos</th>
                <th className="px-4 py-3">Tareas</th>
                <th className="px-4 py-3">Tareas completadas</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.userId} className="border-t border-border">
                  <td className="px-4 py-3 text-text-secondary">{f.email}</td>
                  <td className="px-4 py-3 text-foreground">{f.proyectos}</td>
                  <td className="px-4 py-3 text-foreground">{f.tareas}</td>
                  <td className="px-4 py-3 text-foreground">{f.tareasCompletadas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
