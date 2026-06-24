import type { Tarea } from "@/types/accion";
import { formatMinutos } from "@/lib/accion-format";

export function MetricasModulo({
  tareas,
  hoy,
}: {
  tareas: Tarea[];
  hoy: string;
}) {
  const noBandeja = tareas.filter((t) => !t.bandeja);
  const completadasHoy = noBandeja.filter(
    (t) => t.estado === "completado" && t.fechaProgramada === hoy
  ).length;
  const completadasTotal = noBandeja.filter((t) => t.estado === "completado").length;
  const tiempoTotal = noBandeja.reduce((acc, t) => acc + t.tiempoRealMin, 0);
  const tasaCompletado =
    noBandeja.length > 0 ? Math.round((completadasTotal / noBandeja.length) * 100) : 0;

  const masPostergada = [...noBandeja]
    .filter((t) => t.estado !== "completado")
    .sort((a, b) => a.creadaEn.localeCompare(b.creadaEn))[0];

  const metricas = [
    { label: "Completadas hoy", valor: completadasHoy },
    { label: "Completadas (total)", valor: completadasTotal },
    { label: "Tiempo invertido", valor: formatMinutos(tiempoTotal) },
    { label: "Tasa de completado", valor: `${tasaCompletado}%` },
  ];

  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2 rounded-lg border border-border bg-card px-4 py-3">
      {metricas.map((m) => (
        <div key={m.label} className="flex flex-col gap-0.5">
          <span className="text-xs text-text-muted">{m.label}</span>
          <span className="text-base font-medium text-foreground">{m.valor}</span>
        </div>
      ))}
      {masPostergada && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-text-muted">Más postergada</span>
          <span className="max-w-48 truncate text-base font-medium text-foreground">
            {masPostergada.titulo}
          </span>
        </div>
      )}
    </div>
  );
}
