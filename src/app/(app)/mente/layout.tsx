"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/mente/bandeja", label: "Bandeja Mental" },
  { href: "/mente/ideas", label: "Ideas" },
  { href: "/mente/decisiones", label: "Decisiones" },
  { href: "/mente/notas", label: "Notas" },
];

export default function MenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <Topbar>
        <span className="text-sm font-medium text-foreground">Mente</span>
      </Topbar>

      <div className="flex shrink-0 gap-1 border-b border-border px-5">
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-foreground",
                active && "text-foreground"
              )}
            >
              {tab.label}
              {active && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">{children}</div>
    </>
  );
}
