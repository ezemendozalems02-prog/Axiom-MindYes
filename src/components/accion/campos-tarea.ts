import type { CampoForm, OpcionRef } from "@/components/ui/form-dialog";
import type { Etiqueta } from "@/types/accion";

export function camposTarea(proyectosOpciones?: OpcionRef[]): CampoForm[] {
  const campos: CampoForm[] = [
    { key: "titulo", label: "Título", type: "text" },
    { key: "descripcion", label: "Descripción", type: "textarea" },
    { key: "area", label: "Área de vida", type: "text" },
    { key: "prioridad", label: "Prioridad", type: "select", opciones: ["Crítica", "Alta", "Media", "Baja"] },
    { key: "impacto", label: "Impacto", type: "select", opciones: ["Alto", "Medio", "Bajo"] },
    { key: "urgencia", label: "Urgencia", type: "select", opciones: ["Alta", "Normal"] },
    { key: "energia", label: "Energía requerida", type: "select", opciones: ["Alta", "Media", "Baja"] },
    { key: "tiempoEstimadoMin", label: "Tiempo estimado (min)", type: "number", placeholder: "30" },
  ];
  if (proyectosOpciones) {
    campos.push({
      key: "proyectoId",
      label: "Proyecto",
      type: "select-ref",
      opciones: proyectosOpciones,
      vacio: "Sin proyecto",
    });
  }
  const ETIQUETAS = ["Alta Energía", "Trabajo Profundo", "Delegable", "Administrativo", "Creativo", "Estratégico"];
  campos.push(
    { key: "fechaProgramada", label: "Fecha programada", type: "date" },
    { key: "fechaLimite", label: "Fecha límite", type: "date" },
    {
      key: "etiquetas",
      label: "Etiquetas",
      type: "checklist",
      opciones: ETIQUETAS.map((e) => ({ value: e, label: e })),
    }
  );
  return campos;
}

export function valoresATarea(valores: Record<string, unknown>) {
  return {
    titulo: String(valores.titulo),
    descripcion: valores.descripcion ? String(valores.descripcion) : undefined,
    area: String(valores.area),
    prioridad: valores.prioridad as "Crítica" | "Alta" | "Media" | "Baja",
    impacto: valores.impacto as "Alto" | "Medio" | "Bajo",
    urgencia: valores.urgencia as "Alta" | "Normal",
    energia: valores.energia as "Alta" | "Media" | "Baja",
    tiempoEstimadoMin: Number(valores.tiempoEstimadoMin) || 30,
    proyectoId: (valores.proyectoId as string) || null,
    fechaProgramada: (valores.fechaProgramada as string) || null,
    fechaLimite: (valores.fechaLimite as string) || null,
    etiquetas: ((valores.etiquetas as string[]) ?? []) as Etiqueta[],
  };
}
