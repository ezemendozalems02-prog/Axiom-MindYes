"use client";

import { useFinanzasStore } from "@/stores/finanzas-store";
import { cn } from "@/lib/utils";
import type { Moneda } from "@/types/finanzas";

const OPCIONES: { value: Moneda; label: string }[] = [
  { value: "USD", label: "USD" },
  { value: "ARS", label: "ARS" },
];

export function SelectorMoneda() {
  const monedaVisualizacion = useFinanzasStore((s) => s.monedaVisualizacion);
  const setMonedaVisualizacion = useFinanzasStore((s) => s.setMonedaVisualizacion);

  return (
    <div
      className="flex h-8 shrink-0 rounded-md border border-border bg-popover p-0.5"
      title="Moneda con la que trabajás Finanzas"
    >
      {OPCIONES.map((opcion) => (
        <button
          key={opcion.value}
          onClick={() => setMonedaVisualizacion(opcion.value)}
          className={cn(
            "rounded-[5px] px-2.5 text-xs font-medium transition-colors",
            monedaVisualizacion === opcion.value
              ? "bg-primary text-primary-foreground"
              : "text-text-secondary hover:text-foreground"
          )}
        >
          {opcion.label}
        </button>
      ))}
    </div>
  );
}
