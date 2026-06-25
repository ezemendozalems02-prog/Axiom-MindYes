import Link from "next/link";
import { Brain } from "lucide-react";

import type { Indices } from "@/types/inteligencia";

const ETIQUETAS: { key: keyof Indices; label: string }[] = [
  { key: "claridad", label: "Claridad" },
  { key: "ejecucion", label: "Ejecución" },
  { key: "consistencia", label: "Consistencia" },
  { key: "balance", label: "Balance" },
  { key: "tranquilidad", label: "Tranquilidad" },
];

export function IndicesInteligencia({ indices }: { indices: Indices }) {
  return (
    <Link
      href="/inteligencia"
      className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-border bg-card px-4 py-4 transition-colors hover:border-primary/30 sm:gap-x-8 sm:px-5"
    >
      <div className="flex items-center gap-1.5 text-text-secondary">
        <Brain className="size-3.5" />
        <span className="text-xs font-medium">Inteligencia</span>
      </div>
      {ETIQUETAS.map(({ key, label }) => (
        <div key={key} className="flex flex-col gap-1">
          <span className="text-xs text-text-muted">{label}</span>
          <span className="text-lg font-semibold text-foreground">{indices[key]}</span>
        </div>
      ))}
    </Link>
  );
}
