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
import { getHoyISO } from "@/lib/hoy";

type AccesoDirecto = {
  label: string;
  crear: (texto: string) => void;
};

function useAccesosDirectos(pathname: string | null): AccesoDirecto[] {
  const agregarTarea = useAccionStore((s) => s.agregarTarea);
  const agregarIdea = useMenteStore((s) => s.agregarIdea);
  const agregarNota = useMenteStore((s) => s.agregarNota);
  const agregarDecision = useMenteStore((s) => s.agregarDecision);
  const agregarCliente = useNegocioStore((s) => s.agregarCliente);
  const agregarObjetivo = useDireccionStore((s) => s.agregarObjetivo);

  if (pathname?.startsWith("/accion")) {
    return [
      {
        label: "Tarea",
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
    ];
  }

  if (pathname?.startsWith("/mente")) {
    return [
      {
        label: "Idea",
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
        label: "Nota",
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
        label: "Decisión",
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
    ];
  }

  if (pathname?.startsWith("/negocio")) {
    return [
      {
        label: "Cliente",
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
    ];
  }

  if (pathname?.startsWith("/direccion")) {
    return [
      {
        label: "Objetivo",
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
    ];
  }

  return [];
}

export function QuickCaptureDialog() {
  const open = useQuickCaptureStore((s) => s.open);
  const setOpen = useQuickCaptureStore((s) => s.setOpen);
  const capturar = useMenteStore((s) => s.capturar);
  const pathname = usePathname();
  const accesosDirectos = useAccesosDirectos(pathname);

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
    setConfirmacion("Guardado en tu Bandeja Mental.");
    setTexto("");
  }

  function crearDirecto(acceso: AccesoDirecto) {
    const v = texto.trim();
    if (!v) return;
    acceso.crear(v);
    setConfirmacion(`Creado como ${acceso.label.toLowerCase()}.`);
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
          <DialogTitle>Captura rápida</DialogTitle>
          <DialogDescription>
            Escribí lo que tenés en mente. Se guarda en tu Bandeja Mental para clasificar después.
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

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {accesosDirectos.length > 0 && (
              <span className="text-xs text-text-muted">Crear directo:</span>
            )}
            {accesosDirectos.map((a) => (
              <button
                key={a.label}
                onClick={() => crearDirecto(a)}
                disabled={!texto.trim()}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-text-secondary transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                + {a.label}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={guardarEnBandeja} disabled={!texto.trim()}>
            <Inbox data-icon="inline-start" />
            Guardar
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
