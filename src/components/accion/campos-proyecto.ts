import type { CampoForm, OpcionRef } from "@/components/ui/form-dialog";
import type { Proyecto } from "@/types/accion";

export function camposProyecto(clientesOpciones?: OpcionRef[]): CampoForm[] {
  const campos: CampoForm[] = [
    { key: "nombre", label: "Nombre", type: "text", placeholder: "Ej: Rediseño del sitio" },
    { key: "area", label: "Área de vida", type: "text", placeholder: "Ej: Negocio" },
    { key: "tipo", label: "Tipo de proyecto", type: "select", opciones: ["Propio", "Cliente"] },
  ];
  if (clientesOpciones) {
    campos.push({
      key: "clienteId",
      label: "Cliente (si es para un cliente)",
      type: "select-ref",
      opciones: clientesOpciones,
      vacio: "Sin cliente",
    });
  }
  campos.push(
    { key: "fechaLimite", label: "Fecha límite", type: "date" },
    { key: "estado", label: "Estado", type: "select", opciones: ["en_curso", "pausado", "completado"] }
  );
  return campos;
}

export function valoresAProyecto(
  valores: Record<string, unknown>
): Pick<Proyecto, "nombre" | "area" | "tipo" | "clienteId" | "fechaLimite" | "estado"> {
  return {
    nombre: String(valores.nombre),
    area: String(valores.area),
    tipo: (valores.tipo as Proyecto["tipo"]) || "Propio",
    clienteId: (valores.clienteId as string) || null,
    fechaLimite: (valores.fechaLimite as string) || null,
    estado: valores.estado as Proyecto["estado"],
  };
}
