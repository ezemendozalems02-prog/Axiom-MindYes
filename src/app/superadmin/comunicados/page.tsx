"use client";

import { useEffect, useState } from "react";

import { crearClienteSupabaseBrowser } from "@/lib/supabase/client";
import type { Comunicado, TipoComunicado } from "@/lib/supabase/tipos";

export default function SuperadminComunicadosPage() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState<TipoComunicado>("info");

  async function cargar() {
    const supabase = crearClienteSupabaseBrowser();
    const { data, error: err } = await supabase
      .from("system_announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setComunicados((data ?? []) as Comunicado[]);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crearComunicado(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !mensaje.trim()) return;
    const supabase = crearClienteSupabaseBrowser();
    const { data: sesion } = await supabase.auth.getSession();
    const { error: err } = await supabase.from("system_announcements").insert({
      titulo: titulo.trim(),
      mensaje: mensaje.trim(),
      tipo,
      created_by: sesion.session?.user.id ?? null,
    });
    if (err) setError(err.message);
    else {
      setTitulo("");
      setMensaje("");
      setTipo("info");
      cargar();
    }
  }

  async function toggleActivo(c: Comunicado) {
    const supabase = crearClienteSupabaseBrowser();
    const { error: err } = await supabase.from("system_announcements").update({ activo: !c.activo }).eq("id", c.id);
    if (err) setError(err.message);
    else cargar();
  }

  async function eliminar(id: string) {
    const supabase = crearClienteSupabaseBrowser();
    const { error: err } = await supabase.from("system_announcements").delete().eq("id", id);
    if (err) setError(err.message);
    else cargar();
  }

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Comunicados</h1>
        <p className="text-sm text-text-muted">Anuncios globales para todos los usuarios.</p>
      </div>

      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}

      <form onSubmit={crearComunicado} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título"
          className="rounded border border-border bg-popover px-2 py-1.5 text-sm"
        />
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Mensaje"
          rows={2}
          className="rounded border border-border bg-popover px-2 py-1.5 text-sm"
        />
        <div className="flex items-center gap-3">
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoComunicado)}
            className="rounded border border-border bg-popover px-2 py-1.5 text-xs"
          >
            <option value="info">info</option>
            <option value="warning">warning</option>
            <option value="critico">crítico</option>
          </select>
          <button type="submit" className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
            Publicar
          </button>
        </div>
      </form>

      {cargando ? (
        <p className="text-sm text-text-muted">Cargando…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {comunicados.length === 0 && <p className="text-sm text-text-muted">Sin comunicados todavía.</p>}
          {comunicados.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div>
                <p className="font-medium text-foreground">
                  [{c.tipo}] {c.titulo} {!c.activo && <span className="text-xs text-text-muted">(inactivo)</span>}
                </p>
                <p className="text-sm text-text-secondary">{c.mensaje}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActivo(c)} className="rounded border border-border px-2 py-1 text-xs text-text-secondary hover:text-foreground">
                  {c.activo ? "Desactivar" : "Activar"}
                </button>
                <button onClick={() => eliminar(c.id)} className="rounded border border-border px-2 py-1 text-xs text-text-secondary hover:text-destructive">
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
