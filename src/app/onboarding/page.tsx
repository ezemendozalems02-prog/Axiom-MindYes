"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";

import { crearClienteSupabaseBrowser } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useDireccionStore } from "@/stores/direccion-store";
import { useIdentidadStore } from "@/stores/identidad-store";
import { useAccionStore } from "@/stores/accion-store";
import { getHoyISO } from "@/lib/hoy";
import { Button } from "@/components/ui/button";

import type { NivelObjetivo } from "@/types/direccion";
import type { Frecuencia, Horario } from "@/types/identidad";

const TOTAL_PASOS = 5;

export default function OnboardingPage() {
  const nombreSesion = useAuthStore((s) => s.nombreSesion);
  const [paso, setPaso] = useState(1);
  const [verificando, setVerificando] = useState(true);
  const [finalizando, setFinalizando] = useState(false);

  // Paso 2: visión y propósito
  const [vision, setVision] = useState("");
  const [proposito, setProposito] = useState("");

  // Paso 3: primer objetivo
  const [tituloObjetivo, setTituloObjetivo] = useState("");
  const [areaObjetivo, setAreaObjetivo] = useState("Negocio");
  const [nivelObjetivo, setNivelObjetivo] = useState<NivelObjetivo>("Mensual");

  // Paso 4: primer hábito
  const [nombreHabito, setNombreHabito] = useState("");
  const [horarioHabito, setHorarioHabito] = useState<Horario>("mañana");

  // Paso 5: primera tarea
  const [tituloTarea, setTituloTarea] = useState("");

  useEffect(() => {
    async function verificarSesion() {
      const supabase = crearClienteSupabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.href = "/login";
        return;
      }
      setVerificando(false);
    }
    verificarSesion();
  }, []);

  function siguiente() {
    setPaso((p) => Math.min(p + 1, TOTAL_PASOS));
  }

  async function finalizar() {
    setFinalizando(true);

    if (vision.trim() || proposito.trim()) {
      useDireccionStore.getState().actualizarVision({
        vision: vision.trim() || useDireccionStore.getState().vision.vision,
        proposito: proposito.trim() || useDireccionStore.getState().vision.proposito,
        actualizadoEn: getHoyISO(),
      });
    }

    if (tituloObjetivo.trim()) {
      useDireccionStore.getState().agregarObjetivo({
        id: crypto.randomUUID(),
        titulo: tituloObjetivo.trim(),
        descripcion: "",
        nivel: nivelObjetivo,
        area: areaObjetivo.trim() || "Negocio",
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
      });
    }

    if (nombreHabito.trim()) {
      const frecuencia: Frecuencia = { tipo: "diaria" };
      useIdentidadStore.getState().agregarHabito({
        id: crypto.randomUUID(),
        nombre: nombreHabito.trim(),
        area: areaObjetivo.trim() || "Negocio",
        frecuencia,
        horario: horarioHabito,
        energia: "Media",
        motivacion: "",
        mejorRacha: 0,
        mejorRachaFecha: null,
        historial: {},
      });
    }

    if (tituloTarea.trim()) {
      useAccionStore.getState().agregarTarea({
        id: crypto.randomUUID(),
        titulo: tituloTarea.trim(),
        estado: "sin_empezar",
        prioridad: "Media",
        impacto: "Medio",
        urgencia: "Normal",
        energia: "Media",
        tiempoEstimadoMin: 30,
        tiempoRealMin: 0,
        proyectoId: null,
        objetivoId: null,
        area: areaObjetivo.trim() || "Negocio",
        etiquetas: [],
        dependenciasIds: [],
        fechaLimite: null,
        fechaProgramada: getHoyISO(),
        recurrencia: null,
        delegacion: null,
        bandeja: false,
        creadaEn: getHoyISO(),
      });
    }

    const supabase = crearClienteSupabaseBrowser();
    const { data: sesion } = await supabase.auth.getSession();
    if (sesion.session) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", sesion.session.user.id);
    }

    window.location.href = "/centro-de-control";
  }

  if (verificando) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-text-muted">Cargando…</div>;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_PASOS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i < paso ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>

        <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-2xl shadow-black/40">
          {paso === 1 && (
            <>
              <h1 className="text-lg font-semibold text-foreground">
                Bienvenido{nombreSesion ? `, ${nombreSesion}` : ""} a Axiom Mind
              </h1>
              <p className="text-sm text-text-secondary">
                Tu Sistema Operativo Personal. En 4 pasos cortos vamos a dejar tu cuenta lista
                con lo esencial: tu visión, tu primer objetivo, tu primer hábito y tu primera tarea.
                Podés saltar cualquier paso y completarlo después.
              </p>
              <Button onClick={siguiente} className="mt-1 h-10">
                Empezar
                <ArrowRight data-icon="inline-end" />
              </Button>
            </>
          )}

          {paso === 2 && (
            <>
              <h2 className="text-base font-semibold text-foreground">Tu visión y propósito</h2>
              <p className="text-xs text-text-muted">Dirección → Visión. Podés editarlo después.</p>
              <textarea
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="¿Qué querés construir a 5-10 años?"
                rows={3}
                className="rounded-lg border border-border bg-popover px-3 py-2 text-sm"
              />
              <textarea
                value={proposito}
                onChange={(e) => setProposito(e.target.value)}
                placeholder="¿Cuál es tu propósito?"
                rows={3}
                className="rounded-lg border border-border bg-popover px-3 py-2 text-sm"
              />
              <Button onClick={siguiente} className="mt-1 h-10">
                Continuar
                <ArrowRight data-icon="inline-end" />
              </Button>
            </>
          )}

          {paso === 3 && (
            <>
              <h2 className="text-base font-semibold text-foreground">Tu primer objetivo</h2>
              <p className="text-xs text-text-muted">Dirección → Objetivos.</p>
              <input
                value={tituloObjetivo}
                onChange={(e) => setTituloObjetivo(e.target.value)}
                placeholder="Ej: Conseguir mis primeros 2 clientes"
                className="rounded-lg border border-border bg-popover px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <input
                  value={areaObjetivo}
                  onChange={(e) => setAreaObjetivo(e.target.value)}
                  placeholder="Área (Negocio, Salud…)"
                  className="flex-1 rounded-lg border border-border bg-popover px-3 py-2 text-sm"
                />
                <select
                  value={nivelObjetivo}
                  onChange={(e) => setNivelObjetivo(e.target.value as NivelObjetivo)}
                  className="rounded-lg border border-border bg-popover px-3 py-2 text-sm"
                >
                  <option value="Mensual">Mensual</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Anual">Anual</option>
                </select>
              </div>
              <Button onClick={siguiente} className="mt-1 h-10">
                Continuar
                <ArrowRight data-icon="inline-end" />
              </Button>
            </>
          )}

          {paso === 4 && (
            <>
              <h2 className="text-base font-semibold text-foreground">Tu primer hábito</h2>
              <p className="text-xs text-text-muted">Identidad → Hábitos.</p>
              <input
                value={nombreHabito}
                onChange={(e) => setNombreHabito(e.target.value)}
                placeholder="Ej: Trabajo profundo"
                className="rounded-lg border border-border bg-popover px-3 py-2 text-sm"
              />
              <select
                value={horarioHabito}
                onChange={(e) => setHorarioHabito(e.target.value as Horario)}
                className="rounded-lg border border-border bg-popover px-3 py-2 text-sm"
              >
                <option value="mañana">Mañana</option>
                <option value="tarde">Tarde</option>
                <option value="noche">Noche</option>
              </select>
              <Button onClick={siguiente} className="mt-1 h-10">
                Continuar
                <ArrowRight data-icon="inline-end" />
              </Button>
            </>
          )}

          {paso === 5 && (
            <>
              <h2 className="text-base font-semibold text-foreground">Tu primera tarea de hoy</h2>
              <p className="text-xs text-text-muted">Acción → Mi Día.</p>
              <input
                value={tituloTarea}
                onChange={(e) => setTituloTarea(e.target.value)}
                placeholder="Ej: Prospectar 5 clientes nuevos"
                className="rounded-lg border border-border bg-popover px-3 py-2 text-sm"
              />
              <Button onClick={finalizar} disabled={finalizando} className="mt-1 h-10">
                {finalizando ? "Guardando…" : "Terminar y entrar a Axiom Mind"}
                {!finalizando && <Check data-icon="inline-end" />}
              </Button>
            </>
          )}

          {paso < TOTAL_PASOS && (
            <button
              onClick={siguiente}
              className="self-center text-xs text-text-muted hover:text-foreground"
            >
              Saltar este paso
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
