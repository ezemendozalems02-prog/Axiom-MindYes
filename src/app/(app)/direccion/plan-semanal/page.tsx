"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight } from "lucide-react";

import type { PlanSemanal } from "@/types/direccion";
import { useDireccionStore } from "@/stores/direccion-store";
import { useAccionStore } from "@/stores/accion-store";
import { useIdentidadStore } from "@/stores/identidad-store";
import { getHoyISO } from "@/lib/hoy";

const PASOS = ["Revisión anterior", "Foco de la semana", "Planificación", "Preparación mental"] as const;

function inicioDeSemana(): { inicio: string; fin: string } {
  const hoy = new Date(getHoyISO() + "T00:00:00");
  const dia = hoy.getDay();
  const offsetLunes = dia === 0 ? -6 : 1 - dia;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + offsetLunes);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  return { inicio: getHoyISO(lunes), fin: getHoyISO(domingo) };
}

export default function PlanSemanalPage() {
  const planesSemanales = useDireccionStore((s) => s.planesSemanales);
  const agregarPlanSemanal = useDireccionStore((s) => s.agregarPlanSemanal);
  const objetivos = useDireccionStore((s) => s.objetivos);
  const proyectos = useAccionStore((s) => s.proyectos);
  const habitos = useIdentidadStore((s) => s.habitos);

  const ultimoPlan = planesSemanales[0];
  const { inicio, fin } = useMemo(inicioDeSemana, []);
  const yaHechaEstaSemana = ultimoPlan?.semanaInicio === inicio;

  const [paso, setPaso] = useState(0);
  const [iniciado, setIniciado] = useState(false);

  const [queAvanzo, setQueAvanzo] = useState("");
  const [queQuedoPendiente, setQueQuedoPendiente] = useState("");
  const [queAprendiste, setQueAprendiste] = useState("");
  const [areaDescuidada, setAreaDescuidada] = useState("");

  const [objetivoPrincipal, setObjetivoPrincipal] = useState("");
  const [proyectoPrioritario, setProyectoPrioritario] = useState("");
  const [pendientePostergado, setPendientePostergado] = useState("");

  const [objetivosSemana, setObjetivosSemana] = useState<string[]>([]);
  const [proyectosActivos, setProyectosActivos] = useState<string[]>([]);
  const [bloqueoTiempo, setBloqueoTiempo] = useState("");
  const [habitosPrioritarios, setHabitosPrioritarios] = useState<string[]>([]);

  const [preocupacion, setPreocupacion] = useState("");
  const [porResolver, setPorResolver] = useState("");
  const [comoQuiereSentirse, setComoQuiereSentirse] = useState("");

  function toggle(arr: string[], setArr: (v: string[]) => void, id: string, max?: number) {
    if (arr.includes(id)) {
      setArr(arr.filter((x) => x !== id));
    } else {
      if (max && arr.length >= max) return;
      setArr([...arr, id]);
    }
  }

  function finalizar() {
    const plan: PlanSemanal = {
      id: `ps-${Date.now()}`,
      semanaInicio: inicio,
      semanaFin: fin,
      revisionAnterior: { queAvanzo, queQuedoPendiente, queAprendiste, areaDescuidada },
      foco: { objetivoPrincipal, proyectoPrioritario, pendientePostergado },
      planificacion: {
        objetivosSemanaIds: objetivosSemana,
        proyectosActivosIds: proyectosActivos,
        bloqueoTiempo,
        habitosPrioritarios,
      },
      preparacionMental: { preocupacion, porResolver, comoQuiereSentirse },
      completado: true,
      creadoEn: getHoyISO(),
    };
    agregarPlanSemanal(plan);
    setIniciado(false);
    setPaso(0);
  }

  if (!iniciado) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-semibold text-foreground">Plan Semanal</h1>
          <p className="text-sm text-text-secondary">
            Semana del {inicio} al {fin}. {yaHechaEstaSemana ? "Ya completaste tu plan de esta semana." : "Todavía no armaste el plan de esta semana."}
          </p>
        </div>
        <button
          onClick={() => setIniciado(true)}
          className="flex w-fit items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {yaHechaEstaSemana ? "Rehacer plan de esta semana" : "Empezar Plan Semanal"}
          <ChevronRight className="size-3.5" />
        </button>

        {planesSemanales.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Historial</span>
            {planesSemanales.map((p) => (
              <div key={p.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {p.semanaInicio} → {p.semanaFin}
                  </span>
                  {p.completado && <Check className="size-3.5 text-success" />}
                </div>
                <p className="mt-1 text-xs text-text-secondary">Foco: {p.foco.objetivoPrincipal}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex items-center gap-2">
        {PASOS.map((p, i) => (
          <div key={p} className="flex flex-1 items-center gap-2">
            <div
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                i <= paso ? "bg-primary text-primary-foreground" : "bg-secondary text-text-muted"
              }`}
            >
              {i + 1}
            </div>
            {i < PASOS.length - 1 && <div className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-foreground">{PASOS[paso]}</h2>

      {paso === 0 && (
        <div className="flex flex-col gap-4">
          <Campo label="¿Qué objetivos avanzaron?" value={queAvanzo} onChange={setQueAvanzo} />
          <Campo label="¿Qué quedó pendiente?" value={queQuedoPendiente} onChange={setQueQuedoPendiente} />
          <Campo label="¿Qué aprendiste?" value={queAprendiste} onChange={setQueAprendiste} />
          <Campo label="¿Qué área descuidaste?" value={areaDescuidada} onChange={setAreaDescuidada} />
        </div>
      )}

      {paso === 1 && (
        <div className="flex flex-col gap-4">
          <Campo label="¿Cuál es el objetivo principal de esta semana?" value={objetivoPrincipal} onChange={setObjetivoPrincipal} />
          <Campo label="¿Qué proyecto necesita más atención?" value={proyectoPrioritario} onChange={setProyectoPrioritario} />
          <Campo label="¿Hay algo que venís postergando que esta semana sí o sí debe resolverse?" value={pendientePostergado} onChange={setPendientePostergado} />
        </div>
      )}

      {paso === 2 && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-text-secondary">Los 3 objetivos semanales más importantes</span>
            <div className="flex flex-wrap gap-2">
              {objetivos.filter((o) => o.estado === "Activo").map((o) => (
                <button
                  key={o.id}
                  onClick={() => toggle(objetivosSemana, setObjetivosSemana, o.id, 3)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    objetivosSemana.includes(o.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-text-secondary hover:text-foreground"
                  }`}
                >
                  {o.titulo}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-text-secondary">Proyectos activos esta semana</span>
            <div className="flex flex-wrap gap-2">
              {proyectos.filter((p) => p.estado === "en_curso").map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggle(proyectosActivos, setProyectosActivos, p.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    proyectosActivos.includes(p.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-text-secondary hover:text-foreground"
                  }`}
                >
                  {p.nombre}
                </button>
              ))}
            </div>
          </div>

          <Campo label="Bloquear tiempo en el calendario para trabajo profundo" value={bloqueoTiempo} onChange={setBloqueoTiempo} />

          <div className="flex flex-col gap-2">
            <span className="text-sm text-text-secondary">Hábitos a priorizar esta semana</span>
            <div className="flex flex-wrap gap-2">
              {habitos.map((h) => (
                <button
                  key={h.id}
                  onClick={() => toggle(habitosPrioritarios, setHabitosPrioritarios, h.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    habitosPrioritarios.includes(h.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-text-secondary hover:text-foreground"
                  }`}
                >
                  {h.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {paso === 3 && (
        <div className="flex flex-col gap-4">
          <Campo label="¿Hay algo que te preocupa de la semana?" value={preocupacion} onChange={setPreocupacion} />
          <Campo label="¿Qué necesitás resolver antes de que empiece?" value={porResolver} onChange={setPorResolver} />
          <Campo label="¿Cómo querés sentirte el próximo domingo al revisar esta semana?" value={comoQuiereSentirse} onChange={setComoQuiereSentirse} />
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => (paso === 0 ? setIniciado(false) : setPaso(paso - 1))}
          className="rounded-md px-4 py-2 text-sm text-text-secondary hover:text-foreground"
        >
          {paso === 0 ? "Cancelar" : "Atrás"}
        </button>
        {paso < PASOS.length - 1 ? (
          <button
            onClick={() => setPaso(paso + 1)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Siguiente
            <ChevronRight className="size-3.5" />
          </button>
        ) : (
          <button
            onClick={finalizar}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Check className="size-3.5" />
            Finalizar Plan Semanal
          </button>
        )}
      </div>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-text-secondary">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="rounded-md border border-border bg-popover px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none"
      />
    </div>
  );
}
