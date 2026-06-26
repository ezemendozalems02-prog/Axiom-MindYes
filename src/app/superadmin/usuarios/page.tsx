"use client";

import { useEffect, useState } from "react";

import { crearClienteSupabaseBrowser } from "@/lib/supabase/client";
import type { Perfil, RolPerfil } from "@/lib/supabase/tipos";

export default function SuperadminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    const supabase = crearClienteSupabaseBrowser();
    const { data, error: err } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setUsuarios((data ?? []) as Perfil[]);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cambiarRol(id: string, role: RolPerfil) {
    const supabase = crearClienteSupabaseBrowser();
    const { error: err } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (err) setError(err.message);
    else cargar();
  }

  async function extenderTrial(id: string, dias: number) {
    const supabase = crearClienteSupabaseBrowser();
    const nuevaFecha = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString();
    const { error: err } = await supabase.from("profiles").update({ trial_ends_at: nuevaFecha }).eq("id", id);
    if (err) setError(err.message);
    else cargar();
  }

  function estadoTrial(p: Perfil): string {
    if (!p.trial_ends_at) return "—";
    const vence = new Date(p.trial_ends_at);
    return vence > new Date()
      ? `activo hasta ${vence.toLocaleDateString("es-AR")}`
      : `vencido (${vence.toLocaleDateString("es-AR")})`;
  }

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Usuarios</h1>
        <p className="text-sm text-text-muted">{usuarios.length} cuentas registradas.</p>
      </div>

      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}

      {cargando ? (
        <p className="text-sm text-text-muted">Cargando…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card text-left text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Trial</th>
                <th className="px-4 py-3">Creado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground">{u.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => cambiarRol(u.id, e.target.value as RolPerfil)}
                      className="rounded border border-border bg-popover px-2 py-1 text-xs text-foreground"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                      <option value="superadmin">superadmin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{estadoTrial(u)}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(u.created_at).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => extenderTrial(u.id, 14)}
                      className="rounded border border-border px-2 py-1 text-xs text-text-secondary hover:text-foreground"
                    >
                      +14 días trial
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
