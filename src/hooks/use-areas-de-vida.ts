import { areasDeVida } from "@/lib/mock/centro-de-control";
import { useIdentidadStore } from "@/stores/identidad-store";

export function useAreasDeVidaConectadas() {
  const indiceConsistencia = useIdentidadStore((s) => s.indiceConsistenciaGlobal());

  return areasDeVida.map((area) =>
    area.id === "aprendizaje"
      ? {
          ...area,
          indice: indiceConsistencia,
          observacion: "Índice de Consistencia en vivo, desde tus hábitos en Identidad.",
          actualizado: "Ahora",
        }
      : area
  );
}
