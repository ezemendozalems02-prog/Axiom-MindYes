"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { crearClienteSupabaseBrowser } from "@/lib/supabase/client";

type ProyectoFila = {
  id: string;
  nombre: string;
  area: string;
  tipo: string;
  created_at: string;
};

export default function PilotoSupabasePage() {
  const supabase = crearClienteSupabaseBrowser();

  const [session, setSession] = useState<Session | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const [proyectos, setProyectos] = useState<ProyectoFila[]>([]);
  const [nombreProyecto, setNombreProyecto] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCargandoSesion(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSession(nuevaSesion);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (session) cargarProyectos();
    else setProyectos([]);
  }, [session]);

  async function cargarProyectos() {
    const { data, error: err } = await supabase
      .from("proyectos")
      .select("id, nombre, area, tipo, created_at")
      .order("created_at", { ascending: false });
    if (err) {
      setError(err.message);
      return;
    }
    setProyectos(data ?? []);
  }

  async function onSubmitAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setCargando(true);

    if (modo === "registro") {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) setError(err.message);
      else setMensaje("Cuenta creada. Revisá tu email si pide confirmación, o iniciá sesión directamente.");
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
    }

    setCargando(false);
  }

  async function onLogout() {
    await supabase.auth.signOut();
  }

  async function onCrearProyecto(e: React.FormEvent) {
    e.preventDefault();
    if (!nombreProyecto.trim() || !session) return;
    const { error: err } = await supabase.from("proyectos").insert({
      nombre: nombreProyecto.trim(),
      area: "Prueba",
      tipo: "Propio",
      user_id: session.user.id,
    });
    if (err) setError(err.message);
    else {
      setNombreProyecto("");
      cargarProyectos();
    }
  }

  async function onEliminarProyecto(id: string) {
    const { error: err } = await supabase.from("proyectos").delete().eq("id", id);
    if (err) setError(err.message);
    else cargarProyectos();
  }

  if (cargandoSesion) {
    return <div className="p-8 text-sm text-neutral-400">Cargando…</div>;
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-8 text-neutral-100">
      <div>
        <h1 className="text-lg font-semibold">Piloto Supabase (RLS)</h1>
        <p className="text-sm text-neutral-400">
          Página de prueba aislada para validar Auth real + aislamiento de datos
          por usuario. No afecta al login ni a los módulos productivos.
        </p>
      </div>

      {!session ? (
        <form onSubmit={onSubmitAuth} className="flex flex-col gap-3 rounded-lg border border-neutral-700 p-4">
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => setModo("login")}
              className={modo === "login" ? "font-semibold text-white" : "text-neutral-500"}
            >
              Iniciar sesión
            </button>
            <span className="text-neutral-600">/</span>
            <button
              type="button"
              onClick={() => setModo("registro")}
              className={modo === "registro" ? "font-semibold text-white" : "text-neutral-500"}
            >
              Crear cuenta
            </button>
          </div>

          <input
            type="email"
            placeholder="email@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="contraseña (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          />

          {error && <p className="text-xs text-red-400">{error}</p>}
          {mensaje && <p className="text-xs text-emerald-400">{mensaje}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="rounded bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {cargando ? "Procesando…" : modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg border border-neutral-700 p-4 text-sm">
            <div>
              <p className="font-medium">{session.user.email}</p>
              <p className="text-xs text-neutral-500">user_id: {session.user.id}</p>
            </div>
            <button onClick={onLogout} className="text-xs text-neutral-400 hover:text-white">
              Cerrar sesión
            </button>
          </div>

          <form onSubmit={onCrearProyecto} className="flex gap-2">
            <input
              type="text"
              placeholder="Nombre del proyecto de prueba"
              value={nombreProyecto}
              onChange={(e) => setNombreProyecto(e.target.value)}
              className="flex-1 rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded bg-white px-3 py-2 text-sm font-medium text-black">
              Agregar
            </button>
          </form>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex flex-col gap-2">
            {proyectos.length === 0 && (
              <p className="text-sm text-neutral-500">
                Sin proyectos. Si los creó otro usuario, no deberían aparecer acá (eso es RLS funcionando).
              </p>
            )}
            {proyectos.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded border border-neutral-800 px-3 py-2 text-sm"
              >
                <span>{p.nombre}</span>
                <button
                  onClick={() => onEliminarProyecto(p.id)}
                  className="text-xs text-neutral-500 hover:text-red-400"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
