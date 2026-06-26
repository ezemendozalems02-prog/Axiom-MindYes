"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Megaphone,
  BarChart3,
  Settings2,
  ArrowLeft,
} from "lucide-react";

import { crearClienteSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const SECCIONES = [
  { href: "/superadmin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/superadmin/usuarios", label: "Usuarios", icon: Users },
  { href: "/superadmin/planes", label: "Planes", icon: CreditCard },
  { href: "/superadmin/comunicados", label: "Comunicados", icon: Megaphone },
  { href: "/superadmin/metricas", label: "Métricas", icon: BarChart3 },
  { href: "/superadmin/config", label: "Config", icon: Settings2 },
];

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [estado, setEstado] = useState<"cargando" | "autorizado" | "denegado">("cargando");

  useEffect(() => {
    let activo = true;
    async function verificar() {
      const supabase = crearClienteSupabaseBrowser();
      const { data: sesion } = await supabase.auth.getSession();
      if (!sesion.session) {
        if (activo) setEstado("denegado");
        return;
      }
      const { data: perfil } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", sesion.session.user.id)
        .single();
      if (!activo) return;
      setEstado(perfil?.role === "superadmin" ? "autorizado" : "denegado");
    }
    verificar();
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    if (estado === "denegado") router.replace("/centro-de-control");
  }, [estado, router]);

  if (estado !== "autorizado") {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-text-muted">
        {estado === "cargando" ? "Verificando acceso…" : "No autorizado."}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="hidden h-screen w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar sm:flex">
        <div className="flex h-14 items-center gap-2 px-5">
          <div className="size-2 rounded-full bg-destructive" />
          <span className="text-base font-semibold tracking-tight text-foreground">Superadmin</span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
          {SECCIONES.map((s) => {
            const active = s.href === "/superadmin" ? pathname === s.href : pathname?.startsWith(s.href);
            return (
              <Link
                key={s.href}
                href={s.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors",
                  "hover:bg-sidebar-accent hover:text-foreground",
                  active && "bg-sidebar-accent text-foreground"
                )}
              >
                <s.icon className="size-4 shrink-0" />
                {s.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border px-3 py-3">
          <Link
            href="/centro-de-control"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-sidebar-accent hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver a la app
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
    </div>
  );
}
