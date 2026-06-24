"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

import { pilares } from "@/config/nav";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
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
              N
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-medium text-foreground">Neo</span>
            <span className="text-xs text-text-muted">Sincronizado</span>
          </div>
        </div>
        <button
          aria-label="Configuración"
          className="flex size-7 items-center justify-center rounded-md text-text-secondary hover:bg-sidebar-accent hover:text-foreground"
        >
          <Settings className="size-4" />
        </button>
      </div>
    </aside>
  );
}
