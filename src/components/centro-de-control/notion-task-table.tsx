"use client";

import { useState, useMemo } from "react";
import { Plus, List, GripVertical, ChevronDown, ArrowDownAZ, Trash2 } from "lucide-react";
import { useAccionStore } from "@/stores/accion-store";
import { getHoyISO } from "@/lib/hoy";
import type { EstadoTarea, Prioridad, Tarea, Urgencia, Proyecto } from "@/types/accion";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";

const COLUMNAS = [
  { id: "estado", width: "w-[12%] min-w-[120px]", name: "Estado" },
  { id: "fechaLimite", width: "w-[12%] min-w-[120px]", name: "Fecha Límite" },
  { id: "tarea", width: "flex-1 min-w-[180px]", name: "Tarea" },
  { id: "prioridad", width: "w-[11%] min-w-[110px]", name: "Prioridad" },
  { id: "detalle", width: "flex-1 min-w-[180px]", name: "Detalle" },
  { id: "area", width: "w-[10%] min-w-[100px]", name: "Area" },
  { id: "proyecto", width: "w-[13%] min-w-[130px]", name: "Proyecto" },
  { id: "responsable", width: "w-[12%] min-w-[120px]", name: "Responsable" },
];

export function NotionTaskTable({ proyectoId }: { proyectoId?: string }) {
  const tareas = useAccionStore((s) => s.tareas);
  const proyectos = useAccionStore((s) => s.proyectos);
  const actualizarTarea = useAccionStore((s) => s.actualizarTarea);
  const agregarTarea = useAccionStore((s) => s.agregarTarea);
  const eliminarTarea = useAccionStore((s) => s.eliminarTarea);

  const [sortBy, setSortBy] = useState<"ninguno" | "prioridad" | "estado" | "proyecto">("ninguno");

  // Filtramos tareas activas (mostramos incluso las de la bandeja por si acaso)
  const tareasActivas = useMemo(() => {
    let filtradas = tareas.filter(
      (t) => t.estado !== "completado" && t.estado !== "archivado" && (!proyectoId || t.proyectoId === proyectoId) && t.area?.toLowerCase() !== "finanzas"
    );

    if (sortBy === "prioridad") {
      const p = { "Crítica": 4, "Alta": 3, "Media": 2, "Baja": 1 };
      filtradas.sort((a, b) => (p[b.prioridad as keyof typeof p] || 0) - (p[a.prioridad as keyof typeof p] || 0));
    } else if (sortBy === "estado") {
      const e = { "sin_empezar": 1, "en_progreso": 2, "bloqueado": 3 };
      filtradas.sort((a, b) => (e[a.estado as keyof typeof e] || 0) - (e[b.estado as keyof typeof e] || 0));
    } else if (sortBy === "proyecto") {
      filtradas.sort((a, b) => (a.proyectoId || "").localeCompare(b.proyectoId || ""));
    }
    return filtradas;
  }, [tareas, proyectoId, sortBy]);
  
  console.log("Todas las tareas:", tareas);
  console.log("Tareas activas mostradas:", tareasActivas);

  const handleAgregarFila = () => {
    const nuevaTarea: Tarea = {
      id: Math.random().toString(36).substring(2, 9),
      titulo: "",
      estado: "sin_empezar",
      prioridad: "Media",
      impacto: "Medio",
      urgencia: "Normal",
      energia: "Media",
      tiempoEstimadoMin: 30,
      tiempoRealMin: 0,
      proyectoId: proyectoId || null,
      objetivoId: null,
      area: "Personal",
      etiquetas: [],
      dependenciasIds: [],
      fechaLimite: null,
      fechaProgramada: getHoyISO(),
      bandeja: false,
      creadaEn: getHoyISO(),
      recurrencia: null,
      delegacion: null,
      descripcion: "",
    };
    agregarTarea(nuevaTarea);
  };

  const getEstadoBadge = (estado: EstadoTarea) => {
    switch (estado) {
      case "sin_empezar":
        return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20">Por hacer</span>;
      case "en_progreso":
        return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20">En progreso</span>;
      case "bloqueado":
        return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-orange-500/15 text-orange-400 border border-orange-500/20">Bloqueado</span>;
      case "completado":
        return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/20">Completado</span>;
      default:
        return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-border text-text-muted">Desconocido</span>;
    }
  };

  const getPrioridadBadge = (prioridad: Prioridad) => {
    switch (prioridad) {
      case "Crítica":
        return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20">Crítica</span>;
      case "Alta":
        return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-orange-500/15 text-orange-400 border border-orange-500/20">Alta</span>;
      case "Media":
        return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">Media</span>;
      case "Baja":
        return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/20">Baja</span>;
      default:
        return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-white/5 text-text-secondary border border-white/10">Normal</span>;
    }
  };

  const getProyectoBadge = (proyecto: Proyecto | undefined) => {
    if (!proyecto) {
      return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-slate-500/15 text-slate-400 border border-slate-500/20">Personal</span>;
    }
    // Generar un color pseudoaleatorio consistente basado en el ID del proyecto
    const colors = [
      "bg-purple-500/15 text-purple-400 border-purple-500/20",
      "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      "bg-sky-500/15 text-sky-400 border-sky-500/20",
      "bg-pink-500/15 text-pink-400 border-pink-500/20",
      "bg-amber-500/15 text-amber-400 border-amber-500/20",
    ];
    const index = proyecto.id.charCodeAt(0) % colors.length;
    return <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium border ${colors[index]}`}>{proyecto.nombre}</span>;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-text-muted" />
          <h2 className="text-xl font-semibold text-foreground">Tareas</h2>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-white/5 text-sm font-medium text-text-secondary transition-colors outline-none">
            <ArrowDownAZ className="w-4 h-4" />
            Ordenar: {sortBy === "ninguno" ? "Ninguno" : sortBy === "prioridad" ? "Prioridad" : sortBy === "estado" ? "Estado" : "Proyecto"}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-text-muted">Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("ninguno")}>Ninguno</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("prioridad")}>Prioridad</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("estado")}>Estado</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("proyecto")}>Proyecto</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="w-full">
          {/* Header */}
          <div className="flex border-b border-border/60 bg-background/40 text-xs font-medium text-text-muted">
            <div className="w-8 flex-shrink-0 flex items-center justify-center border-r border-border/60 py-2.5" />
            {COLUMNAS.map((col) => (
              <div
                key={col.id}
                className={`px-3 py-2.5 border-r border-border/60 last:border-r-0 flex-shrink-0 flex items-center ${col.width}`}
              >
                {col.name}
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="flex flex-col">
            {tareasActivas.map((tarea) => {
              const proyecto = proyectos.find((p) => p.id === tarea.proyectoId);
              
              return (
                <div
                  key={tarea.id}
                  className="flex border-b border-border/40 group hover:bg-white/[0.03] transition-colors text-sm"
                >
                  {/* Drag Handle */}
                  <div className="w-8 flex-shrink-0 flex items-center justify-center border-r border-border/40 py-2.5 text-transparent group-hover:text-text-muted cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Estado */}
                  <div className={`px-3 py-2.5 border-r border-border/40 flex-shrink-0 flex items-center ${COLUMNAS.find(c=>c.id==='estado')?.width}`}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center justify-between w-full outline-none group/trigger">
                        {getEstadoBadge(tarea.estado)}
                        <ChevronDown className="w-3 h-3 text-transparent group-hover/trigger:text-text-muted transition-colors ml-1" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[180px]">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-xs text-text-muted">Cambiar estado</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => actualizarTarea(tarea.id, { estado: "sin_empezar" })}>
                            {getEstadoBadge("sin_empezar")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => actualizarTarea(tarea.id, { estado: "en_progreso" })}>
                            {getEstadoBadge("en_progreso")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => actualizarTarea(tarea.id, { estado: "bloqueado" })}>
                            {getEstadoBadge("bloqueado")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => actualizarTarea(tarea.id, { estado: "completado" })}>
                            {getEstadoBadge("completado")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => eliminarTarea(tarea.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            Eliminar tarea
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Fecha Límite */}
                  <div className={`px-3 py-2.5 border-r border-border/40 flex-shrink-0 flex items-center ${COLUMNAS.find(c=>c.id==='fechaLimite')?.width}`}>
                    <input
                      type="date"
                      className="w-full bg-transparent border-none text-text-secondary focus:text-foreground outline-none text-sm transition-colors [color-scheme:dark]"
                      value={tarea.fechaLimite || ""}
                      onChange={(e) => actualizarTarea(tarea.id, { fechaLimite: e.target.value || null })}
                    />
                  </div>

                  {/* Tarea (Título) */}
                  <div className={`px-3 py-2.5 border-r border-border/40 flex-shrink-0 flex items-center ${COLUMNAS.find(c=>c.id==='tarea')?.width}`}>
                    <input
                      type="text"
                      title={tarea.titulo}
                      className="w-full bg-transparent border-none text-foreground outline-none text-sm font-medium placeholder:text-text-muted/40"
                      placeholder="Nueva tarea..."
                      value={tarea.titulo}
                      onChange={(e) => actualizarTarea(tarea.id, { titulo: e.target.value })}
                    />
                  </div>

                  {/* Prioridad */}
                  <div className={`px-3 py-2.5 border-r border-border/40 flex-shrink-0 flex items-center ${COLUMNAS.find(c=>c.id==='prioridad')?.width}`}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center justify-between w-full outline-none group/trigger">
                        {getPrioridadBadge(tarea.prioridad)}
                        <ChevronDown className="w-3 h-3 text-transparent group-hover/trigger:text-text-muted transition-colors ml-1" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[140px]">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-xs text-text-muted">Prioridad</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => actualizarTarea(tarea.id, { prioridad: "Crítica" })}>
                            {getPrioridadBadge("Crítica")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => actualizarTarea(tarea.id, { prioridad: "Alta" })}>
                            {getPrioridadBadge("Alta")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => actualizarTarea(tarea.id, { prioridad: "Media" })}>
                            {getPrioridadBadge("Media")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => actualizarTarea(tarea.id, { prioridad: "Baja" })}>
                            {getPrioridadBadge("Baja")}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Detalle */}
                  <div className={`px-3 py-2.5 border-r border-border/40 flex-shrink-0 flex items-center ${COLUMNAS.find(c=>c.id==='detalle')?.width}`}>
                    <input
                      type="text"
                      title={tarea.descripcion || ""}
                      className="w-full bg-transparent border-none text-text-secondary focus:text-foreground outline-none text-sm placeholder:text-text-muted/40 transition-colors"
                      placeholder="Añadir detalle..."
                      value={tarea.descripcion || ""}
                      onChange={(e) => actualizarTarea(tarea.id, { descripcion: e.target.value })}
                    />
                  </div>

                  {/* Area */}
                  <div className={`px-3 py-2.5 border-r border-border/40 flex-shrink-0 flex items-center ${COLUMNAS.find(c=>c.id==='area')?.width}`}>
                    <input
                      type="text"
                      title={tarea.area || ""}
                      className="w-full bg-transparent border-none text-text-secondary focus:text-foreground outline-none text-sm placeholder:text-text-muted/40 transition-colors"
                      placeholder="Área..."
                      value={tarea.area || ""}
                      onChange={(e) => actualizarTarea(tarea.id, { area: e.target.value })}
                    />
                  </div>

                  {/* Proyecto */}
                  <div className={`px-3 py-2.5 border-r border-border/40 flex-shrink-0 flex items-center ${COLUMNAS.find(c=>c.id==='proyecto')?.width}`}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center justify-between w-full outline-none group/trigger">
                        {getProyectoBadge(proyecto)}
                        <ChevronDown className="w-3 h-3 text-transparent group-hover/trigger:text-text-muted transition-colors ml-1" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[180px] max-h-[300px] overflow-y-auto">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-xs text-text-muted">Seleccionar Proyecto</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => actualizarTarea(tarea.id, { proyectoId: null })}>
                            <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-slate-500/15 text-slate-400 border border-slate-500/20">Personal</span>
                          </DropdownMenuItem>
                          {proyectos.map(p => (
                            <DropdownMenuItem key={p.id} onClick={() => actualizarTarea(tarea.id, { proyectoId: p.id })}>
                              {getProyectoBadge(p)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Responsable */}
                  <div className={`px-3 py-2.5 flex-shrink-0 flex items-center ${COLUMNAS.find(c=>c.id==='responsable')?.width}`}>
                    <input
                      type="text"
                      title={tarea.delegacion?.delegadoA || ""}
                      className="w-full bg-transparent border-none text-text-secondary focus:text-foreground outline-none text-sm placeholder:text-text-muted/40 transition-colors"
                      placeholder="Responsable..."
                      value={tarea.delegacion?.delegadoA || ""}
                      onChange={(e) => actualizarTarea(tarea.id, { 
                        delegacion: e.target.value 
                          ? { delegadoA: e.target.value, fechaSeguimiento: tarea.delegacion?.fechaSeguimiento || getHoyISO() } 
                          : null 
                      })}
                    />
                  </div>
                </div>
              );
            })}

            {/* Fila para agregar */}
            <div 
              className="flex items-center gap-2 px-3 py-3.5 text-sm font-medium text-text-muted hover:text-foreground hover:bg-white/[0.02] cursor-pointer transition-colors"
              onClick={handleAgregarFila}
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo item</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
