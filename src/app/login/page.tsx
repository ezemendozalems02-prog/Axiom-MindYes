"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, User } from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const registrarse = useAuthStore((s) => s.registrarse);

  const [modo, setModo] = useState<"login" | "registro">("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    if (modo === "login") {
      const ok = await login(email, password);
      if (ok) {
        // Navegación dura: cada cuenta tiene su propio namespace de datos en
        // localStorage y los stores deben rehidratar desde cero al cambiar de cuenta.
        window.location.href = "/centro-de-control";
      } else {
        setError("Email o contraseña incorrectos.");
        setCargando(false);
      }
      return;
    }

    const resultado = await registrarse(email, password, nombre);
    if (resultado.ok) {
      window.location.href = "/centro-de-control";
    } else {
      setError(resultado.error ?? "No se pudo crear la cuenta.");
      setCargando(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-primary" />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Axiom Mind
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            {modo === "login"
              ? "Tu Sistema Operativo Personal. Iniciá sesión para continuar."
              : "Creá tu cuenta y arrancá tu prueba gratuita de 14 días."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => { setModo("login"); setError(null); }}
            className={modo === "login" ? "font-semibold text-foreground" : "text-text-muted"}
          >
            Iniciar sesión
          </button>
          <span className="text-border">/</span>
          <button
            type="button"
            onClick={() => { setModo("registro"); setError(null); }}
            className={modo === "registro" ? "font-semibold text-foreground" : "text-text-muted"}
          >
            Crear cuenta
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-2xl shadow-black/40"
        >
          {modo === "registro" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Nombre
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-popover px-3">
                <User className="size-3.5 shrink-0 text-text-muted" />
                <Input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  className="h-10 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
              Email
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-popover px-3">
              <Mail className="size-3.5 shrink-0 text-text-muted" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="h-10 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
              Contraseña
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-popover px-3">
              <Lock className="size-3.5 shrink-0 text-text-muted" />
              <Input
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={modo === "registro" ? 6 : undefined}
                className="h-10 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="shrink-0 text-text-muted hover:text-foreground"
                aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={cargando} className="mt-1 h-10">
            {cargando ? "Verificando…" : modo === "login" ? "Iniciar sesión" : "Crear cuenta y empezar"}
            {!cargando && <ArrowRight data-icon="inline-end" />}
          </Button>
        </form>

        <p className="text-center text-xs text-text-muted">
          {modo === "login"
            ? "Tus credenciales se gestionan desde Configuración una vez dentro del sistema."
            : "14 días gratis, sin tarjeta. Podés cancelar cuando quieras."}
        </p>
      </div>
    </div>
  );
}
