"use client";

import Link from "next/link";
import { Search, Plus, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCommandPaletteStore } from "@/stores/command-palette-store";
import { useQuickCaptureStore } from "@/stores/quick-capture-store";
import { useAuthStore } from "@/stores/auth-store";

export function Topbar({ children }: { children?: React.ReactNode }) {
  const setOpenBusqueda = useCommandPaletteStore((s) => s.setOpen);
  const setOpenCaptura = useQuickCaptureStore((s) => s.setOpen);
  const nombre = useAuthStore((s) => s.nombre);

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border px-5">
      <div className="flex flex-1 items-center gap-2 min-w-0">{children}</div>

      <button
        onClick={() => setOpenBusqueda(true)}
        className="flex h-8 w-56 items-center gap-2 rounded-md border border-border bg-popover px-3 text-sm text-text-muted hover:text-text-secondary"
        aria-label="Búsqueda universal"
      >
        <Search className="size-3.5" />
        Buscar… <span className="ml-auto text-xs">⌘K</span>
      </button>

      <Button
        size="icon"
        variant="default"
        aria-label="Captura rápida"
        onClick={() => setOpenCaptura(true)}
      >
        <Plus className="size-4" />
      </Button>

      <Button size="icon" variant="ghost" aria-label="Notificaciones">
        <Bell className="size-4" />
      </Button>

      <Link href="/configuracion" aria-label="Configuración de cuenta">
        <Avatar size="sm">
          <AvatarFallback className="bg-secondary text-foreground">
            {nombre.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
}
