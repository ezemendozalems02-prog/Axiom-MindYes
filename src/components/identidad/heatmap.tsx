import type { EstadoHabitoDia } from "@/types/identidad";
import { cn } from "@/lib/utils";

const COLOR: Record<EstadoHabitoDia, string> = {
  completado: "bg-success",
  omitido: "bg-secondary",
  pendiente: "bg-primary/30",
};

export function Heatmap({
  dias,
}: {
  dias: { fecha: string; estado: EstadoHabitoDia }[];
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {dias.map((d) => (
        <div
          key={d.fecha}
          title={`${d.fecha} · ${d.estado}`}
          className={cn("size-3 rounded-sm", COLOR[d.estado])}
        />
      ))}
    </div>
  );
}
