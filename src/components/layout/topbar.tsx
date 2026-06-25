"use client";

import Link from "next/link";
import { Search, Plus, Bell, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCommandPaletteStore } from "@/stores/command-palette-store";
import { useQuickCaptureStore } from "@/stores/quick-capture-store";
import { useAuthStore } from "@/stores/auth-store";
import { useMobileNavStore } from "@/stores/mobile-nav-store";

export function Topbar({ children }: { children?: React.ReactNode }) {
  const setOpenBusqueda = useCommandPaletteStore((s) => s.setOpen);
  const setOpenCaptura = useQuickCaptureStore((s) => s.setOpen);
  const setOpenNav = useMobileNavStore((s) => s.setOpen);
  const nombre = useAuthStore((s) => s.nombre);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 sm:gap-4 sm:px-5">
      <button
        onClick={() => setOpenNav(true)}
        aria-label="Abrir menú"
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-secondary hover:text-foreground lg:hidden"
      >
        <Menu className="size-4.5" />
      </button>

      <div className="flex flex-1 items-center gap-2 min-w-0">{children}</div>

      <button
        onClick={() => setOpenBusqueda(true)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-popover text-text-muted hover:text-text-secondary sm:w-56 sm:justify-start sm:gap-2 sm:px-3"
        aria-label="Búsqueda universal"
      >
        <Search className="size-3.5" />
        <span className="hidden text-sm sm:inline">Buscar…</span>
        <span className="ml-auto hidden text-xs sm:inline">⌘K</span>
      </button>

      <Button
        size="icon"
        variant="default"
        aria-label="Captura rápida"
        onClick={() => setOpenCaptura(true)}
      >
        <Plus className="size-4" />
      </Button>

      <Button size="icon" variant="ghost" aria-label="Notificaciones" className="hidden sm:inline-flex">
        <Bell className="size-4" />
      </Button>

      <Link href="/configuracion" aria-label="Configuración de cuenta" className="shrink-0">
        <Avatar size="sm">
          <AvatarFallback className="bg-secondary text-foreground">
            {nombre.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
}
