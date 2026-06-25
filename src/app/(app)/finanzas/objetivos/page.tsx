"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { useFinanzasStore } from "@/stores/finanzas-store";
import { getHoyISO } from "@/lib/hoy";
import { mesDe, sumarGastosDelMes, sumarIngresosDelMes } from "@/lib/finanzas";
import { Button } from "@/components/ui/button";
import { FormDialog, type CampoForm } from "@/components/ui/form-dialog";

const CAMPOS_OBJETIVOS: CampoForm[] = [
  { key: "ingresoMensualTarget", label: "Objetivo de ingreso mensual (USD)", type: "number" },
  { key: "ahorroMensualTarget", label: "Objetivo de ahorro mensual (USD)", type: "number" },
  { key: "fondoEmergenciaTarget", label: "Meta del fondo de emergencia (USD)", type: "number" },
  { key: "fondoEmergenciaActual", label: "Fondo de emergencia actual (USD)", type: "number" },
];

const CAMPOS_INVERSION: CampoForm[] = [
  { key: "nombre", label: "Nombre", type: "text", placeholder: "Ej: Plazo fijo" },
  { key: "monto", label: "Monto (USD)", type: "number", placeholder: "1000" },
];

function BarraObjetivo({
  label,
  actual,
  objetivo,
}: {
  label: string;
  actual: number;
  objetivo: number;
}) {
  const pct = objetivo > 0 ? Math.min(100, Math.round((actual / objetivo) * 100)) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="text-text-secondary">
          ${actual.toLocaleString("es-AR")} / ${objetivo.toLocaleString("es-AR")}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ObjetivosFinancierosPage() {
  const objetivos = useFinanzasStore((s) => s.objetivos);
  const ingresos = useFinanzasStore((s) => s.ingresos);
  const gastos = useFinanzasStore((s) => s.gastos);
  const actualizarObjetivos = useFinanzasStore((s) => s.actualizarObjetivos);
  const agregarInversion = useFinanzasStore((s) => s.agregarInversion);
  const eliminarInversion = useFinanzasStore((s) => s.eliminarInversion);

  const [dialogObjetivosAbierto, setDialogObjetivosAbierto] = useState(false);
  const [dialogInversionAbierto, setDialogInversionAbierto] = useState(false);

  const mesActual = mesDe(getHoyISO());
  const ingresosMes = sumarIngresosDelMes(ingresos, mesActual);
  const gastosMes = sumarGastosDelMes(gastos, mesActual);
  const ahorroMes = Math.max(0, ingresosMes - gastosMes);

  const totalInversiones = objetivos.inversiones.reduce((acc, i) => acc + i.monto, 0);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-8 py-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Objetivos Financieros</h1>
          <p className="text-sm text-text-secondary">
            Tu rumbo económico, no solo tu balance.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setDialogObjetivosAbierto(true)}>
          <Pencil data-icon="inline-start" />
          Editar objetivos
        </Button>
      </div>

      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5">
        <BarraObjetivo
          label="Ingreso mensual"
          actual={ingresosMes}
          objetivo={objetivos.ingresoMensualTarget}
        />
        <BarraObjetivo
          label="Ahorro mensual"
          actual={ahorroMes}
          objetivo={objetivos.ahorroMensualTarget}
        />
        <BarraObjetivo
          label="Fondo de emergencia"
          actual={objetivos.fondoEmergenciaActual}
          objetivo={objetivos.fondoEmergenciaTarget}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Inversiones
          </span>
          <Button size="sm" variant="ghost" onClick={() => setDialogInversionAbierto(true)}>
            <Plus data-icon="inline-start" />
            Agregar
          </Button>
        </div>

        {objetivos.inversiones.length === 0 && (
          <p className="text-sm text-text-muted">Todavía no registraste inversiones.</p>
        )}

        {objetivos.inversiones.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between text-sm">
            <span className="text-foreground">{inv.nombre}</span>
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">${inv.monto.toLocaleString("es-AR")}</span>
              <button
                onClick={() => eliminarInversion(inv.id)}
                className="text-text-muted hover:text-destructive"
                aria-label="Eliminar inversión"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-border pt-2 text-sm font-medium">
          <span className="text-foreground">Total invertido</span>
          <span className="text-foreground">${totalInversiones.toLocaleString("es-AR")}</span>
        </div>
      </div>

      <FormDialog
        open={dialogObjetivosAbierto}
        onOpenChange={setDialogObjetivosAbierto}
        title="Editar objetivos financieros"
        campos={CAMPOS_OBJETIVOS}
        datosIniciales={objetivos}
        onGuardar={(valores) =>
          actualizarObjetivos({
            ingresoMensualTarget: Number(valores.ingresoMensualTarget) || 0,
            ahorroMensualTarget: Number(valores.ahorroMensualTarget) || 0,
            fondoEmergenciaTarget: Number(valores.fondoEmergenciaTarget) || 0,
            fondoEmergenciaActual: Number(valores.fondoEmergenciaActual) || 0,
          })
        }
        submitLabel="Guardar cambios"
      />

      <FormDialog
        open={dialogInversionAbierto}
        onOpenChange={setDialogInversionAbierto}
        title="Nueva inversión"
        campos={CAMPOS_INVERSION}
        onGuardar={(valores) =>
          agregarInversion({
            id: crypto.randomUUID(),
            nombre: String(valores.nombre),
            monto: Number(valores.monto) || 0,
          })
        }
        submitLabel="Agregar"
      />
    </div>
  );
}
