import { useMemo } from "react";

import { useAccionStore } from "@/stores/accion-store";
import { useMenteStore } from "@/stores/mente-store";
import { useNegocioStore } from "@/stores/negocio-store";
import { useIdentidadStore } from "@/stores/identidad-store";
import { useDireccionStore } from "@/stores/direccion-store";
import { useMotorInteligencia } from "@/hooks/use-motor-inteligencia";

export type ResultadoBusqueda = {
  id: string;
  tipo:
    | "Proyecto"
    | "Cliente"
    | "Tarea"
    | "Objetivo"
    | "Idea"
    | "Nota"
    | "Decisión"
    | "Insight"
    | "Revisión";
  titulo: string;
  subtitulo?: string;
  href: string;
};

export function useResultadosBusqueda(query: string): Record<string, ResultadoBusqueda[]> {
  const proyectos = useAccionStore((s) => s.proyectos);
  const tareas = useAccionStore((s) => s.tareas);
  const ideas = useMenteStore((s) => s.ideas);
  const notas = useMenteStore((s) => s.notas);
  const decisiones = useMenteStore((s) => s.decisiones);
  const clientes = useNegocioStore((s) => s.clientes);
  const revisiones = useIdentidadStore((s) => s.revisiones);
  const objetivos = useDireccionStore((s) => s.objetivos);
  const { niveles } = useMotorInteligencia();

  return useMemo(() => {
    const q = query.trim().toLowerCase();
    const resultados: ResultadoBusqueda[] = [];

    proyectos.forEach((p) =>
      resultados.push({
        id: p.id,
        tipo: "Proyecto",
        titulo: p.nombre,
        subtitulo: p.area,
        href: p.area === "Negocio" ? `/negocio/proyectos/${p.id}` : `/accion/proyectos/${p.id}`,
      })
    );

    clientes.forEach((c) =>
      resultados.push({
        id: c.id,
        tipo: "Cliente",
        titulo: c.nombre,
        subtitulo: c.empresa,
        href: "/negocio/crm",
      })
    );

    tareas
      .filter((t) => !t.bandeja)
      .forEach((t) =>
        resultados.push({
          id: t.id,
          tipo: "Tarea",
          titulo: t.titulo,
          subtitulo: t.area,
          href: "/accion/mi-dia",
        })
      );

    objetivos.forEach((o) =>
      resultados.push({
        id: o.id,
        tipo: "Objetivo",
        titulo: o.titulo,
        subtitulo: o.nivel,
        href: `/direccion/objetivos/${o.id}`,
      })
    );

    ideas.forEach((i) =>
      resultados.push({
        id: i.id,
        tipo: "Idea",
        titulo: i.titulo,
        subtitulo: i.area,
        href: "/mente/ideas",
      })
    );

    notas.forEach((n) =>
      resultados.push({
        id: n.id,
        tipo: "Nota",
        titulo: n.titulo,
        subtitulo: n.contenido.slice(0, 60),
        href: "/mente/notas",
      })
    );

    decisiones.forEach((d) =>
      resultados.push({
        id: d.id,
        tipo: "Decisión",
        titulo: d.problema,
        subtitulo: d.estado,
        href: "/mente/decisiones",
      })
    );

    niveles.recomendacion.forEach((r) =>
      resultados.push({
        id: r.id,
        tipo: "Insight",
        titulo: r.texto,
        href: "/inteligencia/insights",
      })
    );

    revisiones.forEach((r) =>
      resultados.push({
        id: r.id,
        tipo: "Revisión",
        titulo: `Revisión ${r.tipo} · ${r.fecha}`,
        href: "/identidad/revisiones",
      })
    );

    const filtrados = q
      ? resultados.filter(
          (r) =>
            r.titulo.toLowerCase().includes(q) ||
            r.subtitulo?.toLowerCase().includes(q)
        )
      : resultados;

    const agrupados: Record<string, ResultadoBusqueda[]> = {};
    filtrados.forEach((r) => {
      if (!agrupados[r.tipo]) agrupados[r.tipo] = [];
      agrupados[r.tipo].push(r);
    });
    return agrupados;
  }, [query, proyectos, clientes, tareas, ideas, notas, decisiones, niveles, revisiones, objetivos]);
}
