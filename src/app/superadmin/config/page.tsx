"use client";

import { useEffect, useState } from "react";

import { crearClienteSupabaseBrowser } from "@/lib/supabase/client";

type FilaConfig = { clave: string; valor: boolean };

export default function SuperadminConfigPage() {
  const [filas, setFilas] = useState<FilaConfig[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    const supabase = crearClienteSupabaseBrowser();
    const { data, error: err } = await supabase.from("system_config").select("*");
    if (err) setError(err.message);
    else setFilas((data ?? []).map((f) => ({ clave: f.clave, valor: f.valor === true })));
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function toggle(clave: string, valorActual: boolean) {
    const supabase = crearClienteSupabaseBrowser();
    const { error: err } = await supabase
      .from("system_config")
      .update({ valor: !valorActual })
      .eq("clave", clave);
    if (err) setError(err.message);
    else cargar();
  }

  const ETIQUETAS: Record<string, string> = {
    signups_habilitados: "Registro de nuevas cuentas habilitado",
    modo_mantenimiento: "Modo mantenimiento",
  };

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Configuración del sistema</h1>
        <p className="text-sm text-text-muted">Toggles globales que afectan a toda la aplicación.</p>
      </div>

      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}

      {cargando ? (
        <p className="text-sm text-text-muted">Cargando…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filas.map((f) => (
            <div key={f.clave} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <span className="text-sm text-foreground">{ETIQUETAS[f.clave] ?? f.clave}</span>
              <button
                onClick={() => toggle(f.clave, f.valor)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  f.valor ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                }`}
              >
                {f.valor ? "Activado" : "Desactivado"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
