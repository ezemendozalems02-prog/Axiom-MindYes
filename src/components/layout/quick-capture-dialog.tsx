"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Check, Inbox } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuickCaptureStore } from "@/stores/quick-capture-store";
import { useMenteStore } from "@/stores/mente-store";
import { useAccionStore } from "@/stores/accion-store";
import { useNegocioStore } from "@/stores/negocio-store";
import { useDireccionStore } from "@/stores/direccion-store";
import { useIdentidadStore } from "@/stores/identidad-store";
import { useFinanzasStore } from "@/stores/finanzas-store";
import { getHoyISO } from "@/lib/hoy";
import { cn } from "@/lib/utils";

type TipoCaptura =
  | "Tarea"
  | "Idea"
  | "Nota"
  | "Decisión"
  | "Cliente"
  | "Proyecto"
  | "Objetivo"
  | "Hábito"
  | "Gasto";

type AccesoDirecto = {
  tipo: TipoCaptura;
  crear: (texto: string) => void;
};

function extraerMonto(texto: string): number {
  const match = texto.match(/(\d+(?:[.,]\d+)?)/);
  return match ? Number(match[1].replace(",", ".")) : 0;
}

function rutaSugerida(pathname: string | null): TipoCaptura | null {
  if (pathname?.startsWith("/accion")) return "Tarea";
  if (pathname?.startsWith("/mente")) return "Idea";
  if (pathname?.startsWith("/negocio")) return "Cliente";
  if (pathname?.startsWith("/direccion")) return "Objetivo";
  if (pathname?.startsWith("/identidad")) return "Hábito";
  if (pathname?.startsWith("/finanzas")) return "Gasto";
  return null;
}

function useAccesosUniversales(): AccesoDirecto[] {
  const agregarTarea = useAccionStore((s) => s.agregarTarea);
  const agregarProyecto = useAccionStore((s) => s.agregarProyecto);
  const agregarIdea = useMenteStore((s) => s.agregarIdea);
  const agregarNota = useMenteStore((s) => s.agregarNota);
  const agregarDecision = useMenteStore((s) => s.agregarDecision);
  const agregarCliente = useNegocioStore((s) => s.agregarCliente);
  const agregarObjetivo = useDireccionStore((s) => s.agregarObjetivo);
  const agregarHabito = useIdentidadStore((s) => s.agregarHabito);
  const agregarGasto = useFinanzasStore((s) => s.agregarGasto);

  return [
    {
      tipo: "Tarea",
      crear: (texto) =>
        agregarTarea({
          id: crypto.randomUUID(),
          titulo: texto,
          estado: "sin_empezar",
          prioridad: "Media",
          impacto: "Medio",
          urgencia: "Normal",
          energia: "Media",
          tiempoEstimadoMin: 30,
          tiempoRealMin: 0,
          proyectoId: null,
          objetivoId: null,
          area: "Organización",
          etiquetas: [],
          dependenciasIds: [],
          fechaLimite: null,
          fechaProgramada: null,
          recurrencia: null,
          delegacion: null,
          bandeja: false,
          creadaEn: getHoyISO(),
        }),
    },
    {
      tipo: "Idea",
      crear: (texto) =>
        agregarIdea({
          id: crypto.randomUUID(),
          titulo: texto,
          descripcion: "",
          area: "Organización",
          potencial: "Media",
          estado: "Nueva",
          origen: "Captura rápida",
          fecha: getHoyISO(),
          accionesPosibles: [],
        }),
    },
    {
      tipo: "Nota",
      crear: (texto) =>
        agregarNota({
          id: crypto.randomUUID(),
          titulo: texto,
          contenido: "",
          vinculo: null,
          creadaEn: getHoyISO(),
        }),
    },
    {
      tipo: "Decisión",
      crear: (texto) =>
        agregarDecision({
          id: crypto.randomUUID(),
          problema: texto,
          opciones: [],
          impacto: "Medio",
          costoRiesgo: "",
          estado: "Abierta",
          fechaLimite: null,
          creadaEn: getHoyISO(),
        }),
    },
    {
      tipo: "Cliente",
      crear: (texto) =>
        agregarCliente({
          id: crypto.randomUUID(),
          nombre: texto,
          empresa: texto,
          sector: "",
          email: "",
          telefono: "",
          estado: "Prospecto",
          notas: [],
          archivos: [],
          reunionesRegistradas: 0,
          propuestasEnviadas: 0,
          proximaAccionFecha: null,
          ultimaInteraccion: getHoyISO(),
          creadoEn: getHoyISO(),
        }),
    },
    {
      tipo: "Proyecto",
      crear: (texto) =>
        agregarProyecto({
          id: crypto.randomUUID(),
          nombre: texto,
          area: "Organización",
          tipo: "Propio",
          clienteId: null,
          progreso: 0,
          fechaLimite: null,
          estado: "en_curso",
        }),
    },
    {
      tipo: "Objetivo",
      crear: (texto) =>
        agregarObjetivo({
          id: crypto.randomUUID(),
          titulo: texto,
          descripcion: "",
          nivel: "Semanal",
          area: "Organización",
          objetivoPadreId: null,
          proyectosIds: [],
          habitosIds: [],
          metricasExito: [],
          fechaLimite: null,
          estado: "Activo",
          motivacion: "",
          obstaculos: [],
          recursos: [],
          creadoEn: getHoyISO(),
        }),
    },
    {
      tipo: "Hábito",
      crear: (texto) =>
        agregarHabito({
          id: crypto.randomUUID(),
          nombre: texto,
          area: "Organización",
          frecuencia: { tipo: "diaria" },
          horario: "sin_horario",
          energia: "Media",
          motivacion: "",
          mejorRacha: 0,
          mejorRachaFecha: null,
          historial: {},
        }),
    },
    {
      tipo: "Gasto",
      crear: (texto) =>
        agregarGasto({
          id: crypto.randomUUID(),
          fecha: getHoyISO(),
          monto: extraerMonto(texto),
          moneda: "ARS",
          categoria: texto,
          areaVida: "Organización",
          tipo: "Variable",
        }),
    },
  ];
}

export function QuickCaptureDialog() {
  const open = useQuickCaptureStore((s) => s.open);
  const setOpen = useQuickCaptureStore((s) => s.setOpen);
  const capturar = useMenteStore((s) => s.capturar);
  const pathname = usePathname();
  const accesos = useAccesosUniversales();
  const sugerido = rutaSugerida(pathname);

  const [texto, setTexto] = useState("");
  const [confirmacion, setConfirmacion] = useState<string | null>(null);

  function reset() {
    setTexto("");
    setConfirmacion(null);
  }

  function cerrar(valor: boolean) {
    setOpen(valor);
    if (!valor) reset();
  }

  function guardarEnBandeja() {
    const v = texto.trim();
    if (!v) return;
    capturar(v);
    setConfirmacion("Guardado en tu Bandeja Mental como pensamiento.");
    setTexto("");
  }

  function crearDirecto(acceso: AccesoDirecto) {
    const v = texto.trim();
    if (!v) return;
    acceso.crear(v);
    setConfirmacion(`Creado como ${acceso.tipo.toLowerCase()}.`);
    setTexto("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      guardarEnBandeja();
    }
  }

  return (
    <Dialog open={open} onOpenChange={cerrar}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Qué querés capturar?</DialogTitle>
          <DialogDescription>
            Escribí lo que tenés en mente y elegí qué es, desde cualquier pantalla. Si no elegís nada, queda
            como pensamiento en tu Bandeja Mental para clasificar después.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          autoFocus
          rows={3}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setConfirmacion(null);
          }}
          onKeyDown={onKeyDown}
          placeholder="Una tarea, una idea, una preocupación, lo que sea…"
        />

        <div className="flex flex-col gap-2">
          <span className="text-xs text-text-muted">Crear directo como:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {accesos.map((a) => (
              <button
                key={a.tipo}
                onClick={() => crearDirecto(a)}
                disabled={!texto.trim()}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  a.tipo === sugerido
                    ? "border-primary/40 text-primary hover:bg-primary/10"
                    : "border-border text-text-secondary hover:border-primary/40 hover:text-foreground"
                )}
              >
                + {a.tipo}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button size="sm" onClick={guardarEnBandeja} disabled={!texto.trim()}>
            <Inbox data-icon="inline-start" />
            Guardar como pensamiento
          </Button>
        </div>

        {confirmacion && (
          <div className="flex items-center gap-1.5 text-xs text-success">
            <Check className="size-3.5" />
            {confirmacion}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
