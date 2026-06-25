"use client";

import { useEffect, useState } from "react";
import { Focus } from "lucide-react";

import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { EstadoGeneral } from "@/components/centro-de-control/estado-general";
import { PrioridadAbsoluta } from "@/components/centro-de-control/prioridad-absoluta";
import { ResumenDelDia } from "@/components/centro-de-control/resumen-del-dia";
import { AreasDeVida } from "@/components/centro-de-control/areas-de-vida";
import { Progreso } from "@/components/centro-de-control/progreso";
import { InteligenciaDelDia } from "@/components/centro-de-control/inteligencia-del-dia";
import { IndicesInteligencia } from "@/components/centro-de-control/indices-inteligencia";
import { ModoFoco } from "@/components/centro-de-control/modo-foco";
import {
  getFechaLarga,
  getFrasePersonalizada,
  getMomentoDelDia,
  getSaludo,
  ORDEN_BLOQUES,
} from "@/lib/momento-del-dia";
import { usuario } from "@/lib/mock/centro-de-control";
import type { MomentoDelDia } from "@/types/centro-de-control";
import { useIdentidadStore } from "@/stores/identidad-store";
import { useAccionStore } from "@/stores/accion-store";
import { useDireccionStore } from "@/stores/direccion-store";
import { useFinanzasStore } from "@/stores/finanzas-store";
import { calcularRachaActual } from "@/lib/habitos";
import { calcularBloquesLibres, calcularTiempoDisponibleMin } from "@/lib/calendario";
import { ordenarPorPrioridad } from "@/lib/priorizacion";
import { getHoyISO } from "@/lib/hoy";
import { useAreasDeVidaConectadas } from "@/hooks/use-areas-de-vida";
import { useMotorInteligencia } from "@/hooks/use-motor-inteligencia";
import {
  calcularEstadoGeneral,
  calcularPrioridadAbsolutaEnVivo,
  calcularProgresoEnVivo,
  nivelesAInsights,
} from "@/lib/inteligencia/centro-de-control";

export default function CentroDeControlPage() {
  const [mounted, setMounted] = useState(false);
  const [momento, setMomento] = useState<MomentoDelDia>("mañana");
  const [modoFoco, setModoFoco] = useState(false);

  const habitosIdentidad = useIdentidadStore((s) => s.habitos);
  const estadoHoyHabitos = useIdentidadStore((s) => s.estadoHoy);
  const marcarHabito = useIdentidadStore((s) => s.marcarHabito);
  const tareas = useAccionStore((s) => s.tareas);
  const proyectos = useAccionStore((s) => s.proyectos);
  const eventosCalendario = useAccionStore((s) => s.eventosCalendario);
  const objetivos = useDireccionStore((s) => s.objetivos);
  const ingresos = useFinanzasStore((s) => s.ingresos);
  const objetivosFinancieros = useFinanzasStore((s) => s.objetivos);
  const areasConConsistencia = useAreasDeVidaConectadas();
  const { indices, niveles } = useMotorInteligencia();

  useEffect(() => {
    setMomento(getMomentoDelDia());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const fecha = getFechaLarga();
  const saludo = getSaludo(momento);
  const frase = getFrasePersonalizada(momento);
  const hoy = getHoyISO();

  const habitosEnVivo = habitosIdentidad.map((h) => ({
    id: h.id,
    nombre: h.nombre,
    completadoHoy: (estadoHoyHabitos[h.id] ?? "pendiente") === "completado",
    racha: calcularRachaActual(h, estadoHoyHabitos[h.id]),
  }));

  const estadoGeneralEnVivo = calcularEstadoGeneral(indices);

  const tareasDeHoy = tareas.filter((t) => t.fechaProgramada === hoy && !t.bandeja);
  const tareasDeHoyOrdenadas = ordenarPorPrioridad(
    tareasDeHoy.filter((t) => t.estado !== "completado"),
    estadoGeneralEnVivo.energia === "Alta" || estadoGeneralEnVivo.energia === "Excelente"
      ? "Alta"
      : estadoGeneralEnVivo.energia === "Baja" || estadoGeneralEnVivo.energia === "Muy baja"
        ? "Baja"
        : "Media",
    hoy
  );
  const prioridadAbsolutaEnVivo = calcularPrioridadAbsolutaEnVivo(
    tareasDeHoyOrdenadas[0],
    proyectos,
    objetivos
  );
  const tareasCriticasEnVivo = tareasDeHoyOrdenadas
    .slice(0, 4)
    .map((t) => ({ id: t.id, titulo: t.titulo }));

  const eventosHoy = eventosCalendario
    .filter((e) => e.fecha === hoy)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
    .map((e) => ({ id: e.id, titulo: e.titulo, hora: e.horaInicio }));

  const resumenEnVivo = {
    tareasCriticas: tareasCriticasEnVivo,
    habitos: habitosEnVivo,
    eventos: eventosHoy,
    tiempoDisponibleMin: calcularTiempoDisponibleMin(hoy, eventosCalendario),
    bloquesLibres: calcularBloquesLibres(hoy, eventosCalendario),
  };

  const progresoEnVivo = calcularProgresoEnVivo({
    objetivos,
    proyectos,
    tareas,
    habitos: habitosIdentidad,
    estadoHoyHabitos,
    ingresos,
    objetivosFinancieros,
    hoy,
  });

  const insightsEnVivo = nivelesAInsights(niveles);

  const bloques: Record<string, React.ReactNode> = {
    estado: (
      <EstadoGeneral
        key="estado"
        saludo={saludo}
        nombre={usuario.nombre}
        fecha={fecha}
        frase={frase}
        estado={estadoGeneralEnVivo}
      />
    ),
    prioridad: (
      <PrioridadAbsoluta
        key="prioridad"
        prioridad={prioridadAbsolutaEnVivo}
        onComenzar={() => setModoFoco(true)}
      />
    ),
    resumen: (
      <ResumenDelDia
        key="resumen"
        resumen={resumenEnVivo}
        onToggleHabito={(id) => marcarHabito(id, "completado")}
      />
    ),
    areas: <AreasDeVida key="areas" areas={areasConConsistencia} />,
    progreso: <Progreso key="progreso" progreso={progresoEnVivo} />,
    inteligencia: <InteligenciaDelDia key="inteligencia" insights={insightsEnVivo} />,
    indices: <IndicesInteligencia key="indices" indices={indices} />,
  };

  return (
    <>
      <Topbar>
        <span className="truncate text-sm font-medium text-foreground">
          Centro de Control
        </span>
        <Button
          size="sm"
          variant="secondary"
          className="ml-2 shrink-0"
          onClick={() => setModoFoco(true)}
        >
          <Focus data-icon="inline-start" />
          <span className="hidden sm:inline">Modo foco</span>
        </Button>
      </Topbar>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-6 sm:px-8 sm:py-10">
          {ORDEN_BLOQUES[momento].map((id) => bloques[id])}
        </div>
      </div>

      {modoFoco && (
        <ModoFoco prioridad={prioridadAbsolutaEnVivo} onSalir={() => setModoFoco(false)} />
      )}
    </>
  );
}
