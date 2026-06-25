import type { Gasto, Ingreso } from "@/types/finanzas";
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
