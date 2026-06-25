"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, X } from "lucide-react";

import { pilares } from "@/config/nav";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useMobileNavStore } from "@/stores/mobile-nav-store";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const nombre = useAuthStore((s) => s.nombreSesion);

  return (
    <>
      <div className="flex h-14 items-center gap-2 px-5">
        <div className="size-2 rounded-full bg-primary" />
        <span className="text-base font-semibold tracking-tight text-foreground">
          Axiom Mind
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {pilares.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors",
                "hover:bg-sidebar-accent hover:text-foreground",
                active && "bg-sidebar-accent text-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback className="bg-secondary text-foreground">
              {nombre.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-medium text-foreground">{nombre}</span>
            <span className="text-xs text-text-muted">Sincronizado</span>
          </div>
        </div>
        <Link
          href="/configuracion"
          aria-label="Configuración"
          onClick={onNavigate}
          className={cn(
            "flex size-7 items-center justify-center rounded-md text-text-secondary hover:bg-sidebar-accent hover:text-foreground",
            pathname?.startsWith("/configuracion") && "bg-sidebar-accent text-foreground"
          )}
        >
          <Settings className="size-4" />
        </Link>
      </div>
    </>
  );
}

export function Sidebar() {
  const open = useMobileNavStore((s) => s.open);
  const setOpen = useMobileNavStore((s) => s.setOpen);

  return (
    <>
      <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar shadow-xl">
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-3.5 flex size-7 items-center justify-center rounded-md text-text-secondary hover:bg-sidebar-accent hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
