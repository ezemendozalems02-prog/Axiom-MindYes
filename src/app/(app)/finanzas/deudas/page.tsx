"use client";

import { useState } from "react";
import { AlertTriangle, CreditCard, Plus } from "lucide-react";

import type { Deuda } from "@/types/finanzas";
import { useFinanzasStore } from "@/stores/finanzas-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHoyISO } from "@/lib/hoy";
import {
  calcularDiasHastaVencimiento,
  calcularProgresoDeuda,
  calcularProximoVencimiento,
  calcularRatioDeudaIngreso,
  calcularSaldoDeuda,
  calcularTotalDeudaPendiente,
  mesDe,
  sumarIngresosDelMes,
} from "@/lib/finanzas";

export default function DeudasPage() {
  const deudas = useFinanzasStore((s) => s.deudas);
  const ingresos = useFinanzasStore((s) => s.ingresos);
  const agregarDeuda = useFinanzasStore((s) => s.agregarDeuda);
  const registrarPagoDeuda = useFinanzasStore((s) => s.registrarPagoDeuda);
  const eliminarDeuda = useFinanzasStore((s) => s.eliminarDeuda);

  const [nombre, setNombre] = useState("");
  const [acreedor, setAcreedor] = useState("");
  const [montoOriginal, setMontoOriginal] = useState("");
  const [tasaInteresMensual, setTasaInteresMensual] = useState("0");
  const [cuotaMensual, setCuotaMensual] = useState("");
  const [diaVencimiento, setDiaVencimiento] = useState("10");
  const [montosPago, setMontosPago] = useState<Record<string, string>>({});

  const hoy = getHoyISO();
  const ingresosMesActual = sumarIngresosDelMes(ingresos, mesDe(hoy));
  const deudaTotal = calcularTotalDeudaPendiente(deudas);
  const ratioDeudaIngreso = calcularRatioDeudaIngreso(deudas, ingresosMesActual);

  const activas = deudas
    .filter((d) => d.estado === "Activa")
    .sort(
      (a, b) =>
        calcularDiasHastaVencimiento(a, hoy) - calcularDiasHastaVencimiento(b, hoy)
    );
  const pagadas = deudas.filter((d) => d.estado === "Pagada");

  function registrar() {
    const valor = Number(montoOriginal);
    const cuota = Number(cuotaMensual);
    const dia = Number(diaVencimiento);
    if (!valor || valor <= 0 || !cuota || cuota <= 0 || !nombre.trim()) return;
    const nueva: Deuda = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      acreedor: acreedor.trim(),
      montoOriginal: valor,
      moneda: "USD",
      tasaInteresMensual: Number(tasaInteresMensual) || 0,
      cuotaMensual: cuota,
      diaVencimiento: Math.min(31, Math.max(1, dia || 10)),
      fechaInicio: hoy,
      estado: "Activa",
      pagos: [],
    };
    agregarDeuda(nueva);
    setNombre("");
    setAcreedor("");
    setMontoOriginal("");
    setTasaInteresMensual("0");
    setCuotaMensual("");
    setDiaVencimiento("10");
  }

  function pagarCuota(deuda: Deuda) {
    const valor = Number(montosPago[deuda.id] ?? deuda.cuotaMensual);
    if (!valor || valor <= 0) return;
    registrarPagoDeuda(deuda.id, valor, hoy);
    setMontosPago((prev) => ({ ...prev, [deuda.id]: "" }));
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Deudas</h1>
        <p className="text-sm text-text-secondary">
          Pendiente: ${deudaTotal.toLocaleString("es-AR")}
          {ratioDeudaIngreso > 0 && ` · ${ratioDeudaIngreso}% de tu ingreso mensual va a cuotas`}
        </p>
      </div>

      {ratioDeudaIngreso > 40 && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="size-3.5" />
          Tus cuotas mensuales superan el 40% de tu ingreso. Tu nivel de endeudamiento es crítico.
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tarjeta Visa"
            className="h-8 w-36 rounded-md border border-border bg-popover px-2 text-sm text-foreground"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">Acreedor</label>
          <input
            value={acreedor}
            onChange={(e) => setAcreedor(e.target.value)}
            placeholder="Banco Galicia"
            className="h-8 w-32 rounded-md border border-border bg-popover px-2 text-sm text-foreground"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">Monto total (USD)</label>
          <input
            value={montoOriginal}
            onChange={(e) => setMontoOriginal(e.target.value)}
            type="number"
            className="h-8 w-28 rounded-md border border-border bg-popover px-2 text-sm text-foreground"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">Cuota mensual</label>
          <input
            value={cuotaMensual}
            onChange={(e) => setCuotaMensual(e.target.value)}
            type="number"
            className="h-8 w-24 rounded-md border border-border bg-popover px-2 text-sm text-foreground"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">Interés mensual %</label>
          <input
            value={tasaInteresMensual}
            onChange={(e) => setTasaInteresMensual(e.target.value)}
            type="number"
            className="h-8 w-24 rounded-md border border-border bg-popover px-2 text-sm text-foreground"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">Día de vencimiento</label>
          <input
            value={diaVencimiento}
            onChange={(e) => setDiaVencimiento(e.target.value)}
            type="number"
            min={1}
            max={31}
            className="h-8 w-20 rounded-md border border-border bg-popover px-2 text-sm text-foreground"
          />
        </div>
        <Button size="sm" onClick={registrar}>
          <Plus data-icon="inline-start" />
          Agregar deuda
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {activas.length === 0 && pagadas.length === 0 && (
          <p className="text-sm text-text-muted">No tenés deudas registradas.</p>
        )}

        {activas.map((d) => {
          const saldo = calcularSaldoDeuda(d);
          const progreso = calcularProgresoDeuda(d);
          const dias = calcularDiasHastaVencimiento(d, hoy);
          const vencida = dias < 0;
          const proxima = dias <= 5;

          return (
            <div key={d.id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="size-4 shrink-0 text-text-muted" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{d.nombre}</span>
                    <span className="text-xs text-text-muted">
                      {d.acreedor || "Sin acreedor"} · cuota ${d.cuotaMensual.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      vencida
                        ? "bg-destructive/15 text-destructive"
                        : proxima
                          ? "bg-warning/15 text-warning"
                          : "bg-muted text-text-secondary"
                    }
                  >
                    {vencida
                      ? `Vencida hace ${Math.abs(dias)}d`
                      : `Vence en ${dias}d (${calcularProximoVencimiento(d, hoy)})`}
                  </Badge>
                  <button
                    onClick={() => eliminarDeuda(d.id)}
                    className="text-xs text-text-muted hover:text-destructive"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Saldo pendiente</span>
                <span className="font-medium text-foreground">
                  ${saldo.toLocaleString("es-AR")} de ${d.montoOriginal.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${progreso}%` }} />
              </div>

              <div className="flex items-center gap-2">
                <input
                  value={montosPago[d.id] ?? ""}
                  onChange={(e) => setMontosPago((prev) => ({ ...prev, [d.id]: e.target.value }))}
                  type="number"
                  placeholder={`${d.cuotaMensual}`}
                  className="h-8 w-28 rounded-md border border-border bg-popover px-2 text-sm text-foreground"
                />
                <Button size="sm" variant="secondary" onClick={() => pagarCuota(d)}>
                  Registrar pago
                </Button>
              </div>
            </div>
          );
        })}

        {pagadas.length > 0 && (
          <div className="flex flex-col gap-2 pt-2">
            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Pagadas
            </span>
            {pagadas.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              >
                <span className="text-sm text-foreground">{d.nombre}</span>
                <Badge className="bg-success/15 text-success">Pagada</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
