import { crearClienteSupabaseBrowser } from "@/lib/supabase/client";
import type { Proyecto, Tarea } from "@/types/accion";

type FilaTarea = {
  id: string;
  titulo: string;
  descripcion: string | null;
  estado: string;
  prioridad: string;
  impacto: string;
  urgencia: string;
  energia: string;
  tiempo_estimado_min: number;
  tiempo_real_min: number;
  proyecto_id: string | null;
  objetivo_id: string | null;
  area: string;
  etiquetas: string[];
  dependencias_ids: string[];
  fecha_limite: string | null;
  fecha_programada: string | null;
  notas: string | null;
  bandeja: boolean;
  recurrencia: string | null;
  delegacion: Tarea["delegacion"] | null;
  created_at: string;
};

type FilaProyecto = {
  id: string;
  nombre: string;
  area: string;
  tipo: string;
  cliente_id: string | null;
  progreso: number;
  fecha_limite: string | null;
  estado: string;
};

function tareaDesdeFila(f: FilaTarea): Tarea {
  return {
    id: f.id,
    titulo: f.titulo,
    descripcion: f.descripcion ?? undefined,
    estado: f.estado as Tarea["estado"],
    prioridad: f.prioridad as Tarea["prioridad"],
    impacto: f.impacto as Tarea["impacto"],
    urgencia: f.urgencia as Tarea["urgencia"],
    energia: f.energia as Tarea["energia"],
    tiempoEstimadoMin: f.tiempo_estimado_min,
    tiempoRealMin: f.tiempo_real_min,
    proyectoId: f.proyecto_id,
    objetivoId: f.objetivo_id,
    area: f.area,
    etiquetas: (f.etiquetas ?? []) as Tarea["etiquetas"],
    dependenciasIds: f.dependencias_ids ?? [],
    fechaLimite: f.fecha_limite,
    fechaProgramada: f.fecha_programada,
    notas: f.notas ?? undefined,
    recurrencia: (f.recurrencia ?? null) as Tarea["recurrencia"],
    delegacion: f.delegacion ?? null,
    bandeja: f.bandeja,
    creadaEn: f.created_at,
  };
}

function filaDesdeTarea(t: Tarea, userId: string) {
  return {
    id: t.id,
    user_id: userId,
    titulo: t.titulo,
    descripcion: t.descripcion ?? null,
    estado: t.estado,
    prioridad: t.prioridad,
    impacto: t.impacto,
    urgencia: t.urgencia,
    energia: t.energia,
    tiempo_estimado_min: t.tiempoEstimadoMin,
    tiempo_real_min: t.tiempoRealMin,
    proyecto_id: t.proyectoId,
    objetivo_id: t.objetivoId,
    area: t.area,
    etiquetas: t.etiquetas,
    dependencias_ids: t.dependenciasIds,
    fecha_limite: t.fechaLimite,
    fecha_programada: t.fechaProgramada,
    notas: t.notas ?? null,
    bandeja: t.bandeja,
    recurrencia: t.recurrencia,
    delegacion: t.delegacion,
  };
}

function proyectoDesdeFila(f: FilaProyecto): Proyecto {
  return {
    id: f.id,
    nombre: f.nombre,
    area: f.area,
    tipo: f.tipo as Proyecto["tipo"],
    clienteId: f.cliente_id,
    progreso: f.progreso,
    fechaLimite: f.fecha_limite,
    estado: f.estado as Proyecto["estado"],
  };
}

function filaDesdeProyecto(p: Proyecto, userId: string) {
  return {
    id: p.id,
    user_id: userId,
    nombre: p.nombre,
    area: p.area,
    tipo: p.tipo,
    cliente_id: p.clienteId ?? null,
    progreso: p.progreso,
    fecha_limite: p.fechaLimite,
    estado: p.estado,
  };
}

export async function obtenerUserIdSupabase(): Promise<string | null> {
  const supabase = crearClienteSupabaseBrowser();
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

export async function fetchAccionDesdeSupabase(): Promise<{
  tareas: Tarea[];
  proyectos: Proyecto[];
} | null> {
  const userId = await obtenerUserIdSupabase();
  if (!userId) return null;

  const supabase = crearClienteSupabaseBrowser();
  const [{ data: filasProyectos, error: errorProyectos }, { data: filasTareas, error: errorTareas }] =
    await Promise.all([
      supabase.from("proyectos").select("*"),
      supabase.from("tareas").select("*"),
    ]);

  if (errorProyectos || errorTareas) {
    console.warn("Error sincronizando Acción con Supabase:", errorProyectos ?? errorTareas);
    return null;
  }

  return {
    proyectos: (filasProyectos as FilaProyecto[]).map(proyectoDesdeFila),
    tareas: (filasTareas as FilaTarea[]).map(tareaDesdeFila),
  };
}

async function conUsuario(accion: (supabase: ReturnType<typeof crearClienteSupabaseBrowser>, userId: string) => Promise<void>) {
  const userId = await obtenerUserIdSupabase();
  if (!userId) return;
  const supabase = crearClienteSupabaseBrowser();
  try {
    await accion(supabase, userId);
  } catch (err) {
    console.warn("Error sincronizando con Supabase:", err);
  }
}

export function syncCrearTarea(tarea: Tarea) {
  return conUsuario(async (supabase, userId) => {
    const { error } = await supabase.from("tareas").insert(filaDesdeTarea(tarea, userId));
    if (error) throw error;
  });
}

export function syncActualizarTarea(id: string, cambios: Partial<Tarea>) {
  return conUsuario(async (supabase, userId) => {
    const fila: Record<string, unknown> = {};
    const mapeo = filaDesdeTarea({ ...cambios } as Tarea, userId);
    for (const key of Object.keys(cambios)) {
      const colKey = key as keyof typeof mapeo;
      if (colKey in mapeo) fila[colKey] = mapeo[colKey];
    }
    delete fila.id;
    delete fila.user_id;
    if (Object.keys(fila).length === 0) return;
    const { error } = await supabase.from("tareas").update(fila).eq("id", id);
    if (error) throw error;
  });
}

export function syncEliminarTarea(id: string) {
  return conUsuario(async (supabase) => {
    const { error } = await supabase.from("tareas").delete().eq("id", id);
    if (error) throw error;
  });
}

export function syncCrearProyecto(proyecto: Proyecto) {
  return conUsuario(async (supabase, userId) => {
    const { error } = await supabase.from("proyectos").insert(filaDesdeProyecto(proyecto, userId));
    if (error) throw error;
  });
}

export function syncActualizarProyecto(id: string, cambios: Partial<Proyecto>) {
  return conUsuario(async (supabase, userId) => {
    const fila: Record<string, unknown> = {};
    const mapeo = filaDesdeProyecto({ ...cambios } as Proyecto, userId);
    for (const key of Object.keys(cambios)) {
      const colKey = key as keyof typeof mapeo;
      if (colKey in mapeo) fila[colKey] = mapeo[colKey];
    }
    delete fila.id;
    delete fila.user_id;
    if (Object.keys(fila).length === 0) return;
    const { error } = await supabase.from("proyectos").update(fila).eq("id", id);
    if (error) throw error;
  });
}

export function syncEliminarProyecto(id: string) {
  return conUsuario(async (supabase) => {
    await supabase.from("tareas").update({ proyecto_id: null }).eq("proyecto_id", id);
    const { error } = await supabase.from("proyectos").delete().eq("id", id);
    if (error) throw error;
  });
}
