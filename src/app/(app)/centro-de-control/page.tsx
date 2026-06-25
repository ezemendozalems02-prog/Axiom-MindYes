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
import {
  estadoGeneral,
  insights,
  prioridadAbsoluta,
  progreso,
  resumenDelDia,
  usuario,
} from "@/lib/mock/centro-de-control";
import type { MomentoDelDia } from "@/types/centro-de-control";
import { useIdentidadStore } from "@/stores/identidad-store";
import { calcularRachaActual } from "@/lib/habitos";
import { useAreasDeVidaConectadas } from "@/hooks/use-areas-de-vida";
import { useMotorInteligencia } from "@/hooks/use-motor-inteligencia";

export default function CentroDeControlPage() {
  const [mounted, setMounted] = useState(false);
  const [momento, setMomento] = useState<MomentoDelDia>("mañana");
  const [modoFoco, setModoFoco] = useState(false);

  const habitosIdentidad = useIdentidadStore((s) => s.habitos);
  const estadoHoyHabitos = useIdentidadStore((s) => s.estadoHoy);
  const marcarHabito = useIdentidadStore((s) => s.marcarHabito);
  const areasConConsistencia = useAreasDeVidaConectadas();
  const { indices } = useMotorInteligencia();

  useEffect(() => {
    setMomento(getMomentoDelDia());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const fecha = getFechaLarga();
  const saludo = getSaludo(momento);
  const frase = getFrasePersonalizada(momento);

  const habitosEnVivo = habitosIdentidad.map((h) => ({
    id: h.id,
    nombre: h.nombre,
    completadoHoy: (estadoHoyHabitos[h.id] ?? "pendiente") === "completado",
    racha: calcularRachaActual(h, estadoHoyHabitos[h.id]),
  }));

  const bloques: Record<string, React.ReactNode> = {
    estado: (
      <EstadoGeneral
        key="estado"
        saludo={saludo}
        nombre={usuario.nombre}
        fecha={fecha}
        frase={frase}
        estado={estadoGeneral}
      />
    ),
    prioridad: (
      <PrioridadAbsoluta
        key="prioridad"
        prioridad={prioridadAbsoluta}
        onComenzar={() => setModoFoco(true)}
      />
    ),
    resumen: (
      <ResumenDelDia
        key="resumen"
        resumen={{ ...resumenDelDia, habitos: habitosEnVivo }}
        onToggleHabito={(id) => marcarHabito(id, "completado")}
      />
    ),
    areas: <AreasDeVida key="areas" areas={areasConConsistencia} />,
    progreso: <Progreso key="progreso" progreso={progreso} />,
    inteligencia: <InteligenciaDelDia key="inteligencia" insights={insights} />,
    indices: <IndicesInteligencia key="indices" indices={indices} />,
  };

  return (
    <>
      <Topbar>
        <span className="text-sm font-medium text-foreground">
          Centro de Control
        </span>
        <Button
          size="sm"
          variant="secondary"
          className="ml-2"
          onClick={() => setModoFoco(true)}
        >
          <Focus data-icon="inline-start" />
          Modo foco
        </Button>
      </Topbar>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-8 py-10">
          {ORDEN_BLOQUES[momento].map((id) => bloques[id])}
        </div>
      </div>

      {modoFoco && (
        <ModoFoco prioridad={prioridadAbsoluta} onSalir={() => setModoFoco(false)} />
      )}
    </>
  );
}
