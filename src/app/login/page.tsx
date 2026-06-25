"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    setTimeout(() => {
      const ok = login(email, password);
      if (ok) {
        router.push("/centro-de-control");
      } else {
        setError("Email o contraseña incorrectos.");
        setCargando(false);
      }
    }, 350);
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
            Tu Sistema Operativo Personal. Iniciá sesión para continuar.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-2xl shadow-black/40"
        >
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
            {cargando ? "Verificando…" : "Iniciar sesión"}
            {!cargando && <ArrowRight data-icon="inline-end" />}
          </Button>
        </form>

        <p className="text-center text-xs text-text-muted">
          Tus credenciales se gestionan desde Configuración una vez dentro del sistema.
        </p>
      </div>
    </div>
  );
}
