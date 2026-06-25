import type { Deuda, Gasto, Ingreso } from "@/types/finanzas";
import { getHoyISO } from "@/lib/hoy";

export const VALOR_HORA_USD = 35;

export function mesDe(fechaISO: string): string {
  return fechaISO.slice(0, 7); // YYYY-MM
}

export function mesAnterior(mes: string): string {
  const [y, m] = mes.split("-").map(Number);
  const fecha = new Date(y, m - 2, 1);
  return `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, "0")}`;
}

export function sumarIngresosDelMes(ingresos: Ingreso[], mes: string): number {
  return ingresos
    .filter((i) => mesDe(i.fecha) === mes && i.estado !== "Pendiente")
    .reduce((acc, i) => acc + i.monto, 0);
}

export function sumarGastosDelMes(gastos: Gasto[], mes: string): number {
  return gastos.filter((g) => mesDe(g.fecha) === mes).reduce((acc, g) => acc + g.monto, 0);
}

export function gastosPorCategoria(gastos: Gasto[], mes: string) {
  const delMes = gastos.filter((g) => mesDe(g.fecha) === mes);
  const totales = new Map<string, number>();
  delMes.forEach((g) => totales.set(g.categoria, (totales.get(g.categoria) ?? 0) + g.monto));
  return Array.from(totales.entries())
    .map(([categoria, monto]) => ({ categoria, monto }))
    .sort((a, b) => b.monto - a.monto);
}

export function flujoProyectado30Dias(ingresos: Ingreso[], gastos: Gasto[]): number {
  const hoy = new Date(getHoyISO() + "T00:00:00");
  const en30Dias = new Date(hoy);
  en30Dias.setDate(en30Dias.getDate() + 30);

  const ingresosProyectados = ingresos
    .filter((i) => {
      const fecha = new Date(i.fecha + "T00:00:00");
      return fecha >= hoy && fecha <= en30Dias;
    })
    .reduce((acc, i) => acc + i.monto, 0);

  const gastosFijosMensuales = gastos
    .filter((g) => g.tipo === "Fijo")
    .reduce((acc, g) => acc + g.monto, 0);

  return Math.round(ingresosProyectados - gastosFijosMensuales);
}

export function calcularSaldoDeuda(deuda: Deuda): number {
  const pagado = deuda.pagos.reduce((acc, p) => acc + p.monto, 0);
  return Math.max(0, Math.round((deuda.montoOriginal - pagado) * 100) / 100);
}

export function calcularProgresoDeuda(deuda: Deuda): number {
  if (deuda.montoOriginal <= 0) return 100;
  const pagado = deuda.pagos.reduce((acc, p) => acc + p.monto, 0);
  return Math.min(100, Math.round((pagado / deuda.montoOriginal) * 100));
}

export function calcularProximoVencimiento(deuda: Deuda, hoy: string): string {
  const fechaHoy = new Date(hoy + "T00:00:00");
  const candidato = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), deuda.diaVencimiento);
  if (candidato < fechaHoy) candidato.setMonth(candidato.getMonth() + 1);
  return getHoyISO(candidato);
}

export function calcularDiasHastaVencimiento(deuda: Deuda, hoy: string): number {
  const fechaHoy = new Date(hoy + "T00:00:00");
  const vencimiento = new Date(calcularProximoVencimiento(deuda, hoy) + "T00:00:00");
  return Math.round((vencimiento.getTime() - fechaHoy.getTime()) / (1000 * 60 * 60 * 24));
}

export function calcularTotalDeudaPendiente(deudas: Deuda[]): number {
  return deudas
    .filter((d) => d.estado === "Activa")
    .reduce((acc, d) => acc + calcularSaldoDeuda(d), 0);
}

export function calcularCuotasMensualesActivas(deudas: Deuda[]): number {
  return deudas.filter((d) => d.estado === "Activa").reduce((acc, d) => acc + d.cuotaMensual, 0);
}

export function calcularRatioDeudaIngreso(deudas: Deuda[], ingresoMensual: number): number {
  if (ingresoMensual <= 0) return 0;
  return Math.round((calcularCuotasMensualesActivas(deudas) / ingresoMensual) * 100);
}

export function generarSerieMensual(
  ingresos: Ingreso[],
  gastos: Gasto[],
  meses: string[]
) {
  return meses.map((mes) => ({
    mes,
    ingresos: sumarIngresosDelMes(ingresos, mes),
    gastos: sumarGastosDelMes(gastos, mes),
  }));
}
