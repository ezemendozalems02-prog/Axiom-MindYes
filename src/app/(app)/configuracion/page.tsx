"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LogOut, Mail, RotateCcw, ShieldCheck, User } from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";
import { useCuentaMetaStore } from "@/stores/cuenta-meta-store";
import { aplicarSeedDemo } from "@/lib/demo/seed-demo-user";
import { aplicarDatosRealesEzequiel } from "@/lib/seed/datos-reales-ezequiel";
import { Topbar } from "@/components/layout/topbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ConfiguracionPage() {
  const router = useRouter();
  const nombre = useAuthStore((s) => s.nombreSesion);
  const email = useAuthStore((s) => s.emailSesion);
  const esCuentaDemo = useAuthStore((s) => s.esCuentaDemo);
  const actualizarCuenta = useAuthStore((s) => s.actualizarCuenta);
  const cambiarPassword = useAuthStore((s) => s.cambiarPassword);
  const logout = useAuthStore((s) => s.logout);
  const marcarSeedDemoAplicado = useCuentaMetaStore((s) => s.marcarSeedDemoAplicado);

  const [nombreInput, setNombreInput] = useState(nombre);
  const [emailInput, setEmailInput] = useState(email);
  const [confirmacionCuenta, setConfirmacionCuenta] = useState(false);
  const [confirmacionReset, setConfirmacionReset] = useState(false);

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmarNueva, setConfirmarNueva] = useState("");
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [confirmacionPassword, setConfirmacionPassword] = useState(false);

  function guardarCuenta() {
    actualizarCuenta({ nombre: nombreInput.trim(), email: emailInput.trim() });
    setConfirmacionCuenta(true);
    setTimeout(() => setConfirmacionCuenta(false), 2500);
  }

  function guardarPassword() {
    setErrorPassword(null);
    if (nueva.length < 6) {
      setErrorPassword("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (nueva !== confirmarNueva) {
      setErrorPassword("Las contraseñas nuevas no coinciden.");
      return;
    }
    const ok = cambiarPassword(actual, nueva);
    if (!ok) {
      setErrorPassword("La contraseña actual no es correcta.");
      return;
    }
    setActual("");
    setNueva("");
    setConfirmarNueva("");
    setConfirmacionPassword(true);
    setTimeout(() => setConfirmacionPassword(false), 2500);
  }

  function cerrarSesion() {
    logout();
    router.push("/login");
  }

  function restablecerDatosDemo() {
    aplicarSeedDemo();
    marcarSeedDemoAplicado();
    setConfirmacionReset(true);
    setTimeout(() => setConfirmacionReset(false), 2500);
  }

  const [cargandoSeedReal, setCargandoSeedReal] = useState(false);
  async function cargarDatosRealesTemp() {
    setCargandoSeedReal(true);
    await aplicarDatosRealesEzequiel();
    setCargandoSeedReal(false);
    alert("Listo, ya están tus datos cargados.");
  }

  return (
    <>
      <Topbar>
        <span className="text-sm font-medium text-foreground">Configuración</span>
      </Topbar>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-6 sm:px-8 sm:py-10">
          {!esCuentaDemo && (
            <button
              onClick={cargarDatosRealesTemp}
              disabled={cargandoSeedReal}
              className="rounded-md border border-warning bg-warning/10 px-3 py-2 text-xs text-warning"
            >
              {cargandoSeedReal ? "Cargando..." : "[TEMP] Cargar mis datos reales"}
            </button>
          )}

          <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <User className="size-4 text-text-muted" />
              <h2 className="text-base font-semibold text-foreground">Datos de la cuenta</h2>
            </div>

            {esCuentaDemo && (
              <p className="rounded-md bg-warning/10 px-3 py-2 text-xs text-warning">
                Estás usando la cuenta demo (demo@axiommind.app). Los datos de la cuenta no son editables.
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Nombre
              </label>
              <Input
                value={nombreInput}
                onChange={(e) => setNombreInput(e.target.value)}
                disabled={esCuentaDemo}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Email
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-popover px-3">
                <Mail className="size-3.5 shrink-0 text-text-muted" />
                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  disabled={esCuentaDemo}
                  className="border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button size="sm" onClick={guardarCuenta} disabled={esCuentaDemo}>
                Guardar cambios
              </Button>
              {confirmacionCuenta && (
                <span className="flex items-center gap-1 text-xs text-success">
                  <Check className="size-3.5" />
                  Cuenta actualizada.
                </span>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-text-muted" />
              <h2 className="text-base font-semibold text-foreground">Seguridad</h2>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Contraseña actual
              </label>
              <Input
                type="password"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                disabled={esCuentaDemo}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Nueva contraseña
              </label>
              <Input
                type="password"
                value={nueva}
                onChange={(e) => setNueva(e.target.value)}
                disabled={esCuentaDemo}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Confirmar nueva contraseña
              </label>
              <Input
                type="password"
                value={confirmarNueva}
                onChange={(e) => setConfirmarNueva(e.target.value)}
                disabled={esCuentaDemo}
              />
            </div>

            {errorPassword && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {errorPassword}
              </p>
            )}

            <div className="flex items-center gap-3">
              <Button size="sm" variant="secondary" onClick={guardarPassword} disabled={esCuentaDemo}>
                Cambiar contraseña
              </Button>
              {confirmacionPassword && (
                <span className="flex items-center gap-1 text-xs text-success">
                  <Check className="size-3.5" />
                  Contraseña actualizada.
                </span>
              )}
            </div>
          </section>

          {esCuentaDemo && (
            <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <RotateCcw className="size-4 text-text-muted" />
                <h2 className="text-base font-semibold text-foreground">Datos demo</h2>
              </div>
              <p className="text-sm text-text-secondary">
                La cuenta demo tiene sus propios datos, separados por completo de tu cuenta real —
                vivís en un espacio de almacenamiento aislado. Si los desordenaste explorando, podés
                reiniciarlos al estado original de Matías Guerrero.
              </p>
              <div className="flex items-center gap-3">
                <Button size="sm" variant="secondary" onClick={restablecerDatosDemo}>
                  <RotateCcw data-icon="inline-start" />
                  Restablecer datos demo
                </Button>
                {confirmacionReset && (
                  <span className="flex items-center gap-1 text-xs text-success">
                    <Check className="size-3.5" />
                    Datos demo restablecidos.
                  </span>
                )}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground">Sesión</h2>
            <p className="text-sm text-text-secondary">
              Tu sesión se guarda en este navegador. Cerrar sesión te pedirá volver a ingresar tu
              email y contraseña.
            </p>
            <Button size="sm" variant="destructive" className="w-fit" onClick={cerrarSesion}>
              <LogOut data-icon="inline-start" />
              Cerrar sesión
            </Button>
          </section>
        </div>
      </div>
    </>
  );
}
