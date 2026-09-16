"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";

import { useFinanzasStore } from "@/stores/finanzas-store";
import { cn } from "@/lib/utils";
import { FormDialog, type CampoForm } from "@/components/ui/form-dialog";
import type { Moneda } from "@/types/finanzas";

const OPCIONES: { value: Moneda; label: string }[] = [
  { value: "USD", label: "USD" },
  { value: "ARS", label: "ARS" },
];

const CAMPOS_COTIZACION: CampoForm[] = [
  { key: "cotizacionDolar", label: "Cotización 1 USD = ? ARS", type: "number", placeholder: "1450" },
];

export function SelectorMoneda() {
  const monedaVisualizacion = useFinanzasStore((s) => s.monedaVisualizacion);
  const cotizacionDolar = useFinanzasStore((s) => s.cotizacionDolar);
  const setMonedaVisualizacion = useFinanzasStore((s) => s.setMonedaVisualizacion);
  const setCotizacionDolar = useFinanzasStore((s) => s.setCotizacionDolar);
  const [dialogAbierto, setDialogAbierto] = useState(false);

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <div className="flex h-8 shrink-0 rounded-md border border-border bg-popover p-0.5">
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

      {monedaVisualizacion === "ARS" && (
        <button
          onClick={() => setDialogAbierto(true)}
          className="flex h-8 shrink-0 items-center gap-1 rounded-md border border-border bg-popover px-2 text-xs text-text-muted hover:text-foreground"
          aria-label="Editar cotización del dólar"
          title={`1 USD = $${cotizacionDolar.toLocaleString("es-AR")}`}
        >
          <Settings2 className="size-3" />
          <span className="hidden sm:inline">${cotizacionDolar.toLocaleString("es-AR")}</span>
        </button>
      )}

      <FormDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        title="Cotización del dólar"
        description="Se usa para convertir los montos (cargados en USD) a pesos."
        campos={CAMPOS_COTIZACION}
        datosIniciales={{ cotizacionDolar }}
        onGuardar={(valores) => setCotizacionDolar(Number(valores.cotizacionDolar) || 0)}
        submitLabel="Guardar"
      />
    </div>
  );
}
