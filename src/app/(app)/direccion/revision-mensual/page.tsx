"use client";

import { useState } from "react";

import type { RevisionMensual } from "@/types/direccion";
import { useDireccionStore } from "@/stores/direccion-store";
import { getHoyISO } from "@/lib/hoy";

function mesActualLabel(): string {
  const hoy = new Date(getHoyISO() + "T00:00:00");
  return hoy.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

export default function RevisionMensualPage() {
  const revisiones = useDireccionStore((s) => s.revisionesMensuales);
  const agregarRevisionMensual = useDireccionStore((s) => s.agregarRevisionMensual);
  const [editando, setEditando] = useState(false);

  const [queFunciono, setQueFunciono] = useState("");
  const [queNoFunciono, setQueNoFunciono] = useState("");
  const [queCambiarias, setQueCambiarias] = useState("");
  const [queDescubriste, setQueDescubriste] = useState("");
  const [objetivosAModificar, setObjetivosAModificar] = useState("");
  const [habitosAAjustar, setHabitosAAjustar] = useState("");
  const [prioridadesQueCambiaron, setPrioridadesQueCambiaron] = useState("");
  const [palabraDelMes, setPalabraDelMes] = useState("");
  const [objetivosPrincipales, setObjetivosPrincipales] = useState("");
  const [queNecesitasDiferente, setQueNecesitasDiferente] = useState("");

  function guardar() {
    const revision: RevisionMensual = {
      id: `rm-${Date.now()}`,
      mes: getHoyISO().slice(0, 7),
      resultados: {
        objetivosCumplidos: [],
        objetivosNoCumplidos: [],
        queAvanzo: "",
        queSeEstanco: "",
        indiceConsistenciaHabitos: 0,
        ingresosVsObjetivo: "",
        gastosVsPresupuesto: "",
      },
      aprendizajes: { queFunciono, queNoFunciono, queCambiarias, queDescubriste },
      ajusteDeCurso: { objetivosAModificar, habitosAAjustar, prioridadesQueCambiaron },
      intencionProximoMes: {
        palabraDelMes,
        objetivosPrincipales: objetivosPrincipales.split(",").map((s) => s.trim()).filter(Boolean),
        queNecesitasDiferente,
      },
      creadaEn: getHoyISO(),
    };
    agregarRevisionMensual(revision);
    setEditando(false);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 px-8 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold capitalize text-foreground">Revisión Mensual — {mesActualLabel()}</h1>
        {!editando && (
          <button
            onClick={() => setEditando(true)}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Nueva revisión
          </button>
        )}
      </div>

      {editando && (
        <div className="flex flex-col gap-8 rounded-lg border border-border bg-card p-6">
          <Bloque titulo="Aprendizajes">
            <Campo label="¿Qué funcionó este mes?" value={queFunciono} onChange={setQueFunciono} />
            <Campo label="¿Qué no funcionó?" value={queNoFunciono} onChange={setQueNoFunciono} />
            <Campo label="¿Qué cambiarías?" value={queCambiarias} onChange={setQueCambiarias} />
            <Campo label="¿Qué descubriste sobre vos mismo?" value={queDescubriste} onChange={setQueDescubriste} />
          </Bloque>

          <Bloque titulo="Ajuste de curso">
            <Campo label="¿Algún objetivo necesita modificarse?" value={objetivosAModificar} onChange={setObjetivosAModificar} />
            <Campo label="¿Hay algún hábito que abandonar o agregar?" value={habitosAAjustar} onChange={setHabitosAAjustar} />
            <Campo label="¿Cambió alguna prioridad?" value={prioridadesQueCambiaron} onChange={setPrioridadesQueCambiaron} />
          </Bloque>

          <Bloque titulo="Intención del próximo mes">
            <Campo label="¿Cuál es la palabra o tema de este mes?" value={palabraDelMes} onChange={setPalabraDelMes} />
            <Campo label="Los 3 objetivos más importantes (separados por coma)" value={objetivosPrincipales} onChange={setObjetivosPrincipales} />
            <Campo label="¿Qué necesitás que sea diferente?" value={queNecesitasDiferente} onChange={setQueNecesitasDiferente} />
          </Bloque>

          <div className="flex justify-end gap-2">
            <button onClick={() => setEditando(false)} className="px-4 py-2 text-sm text-text-secondary hover:text-foreground">
              Cancelar
            </button>
            <button
              onClick={guardar}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Guardar revisión
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Historial</span>
        {revisiones.map((r) => (
          <article key={r.id} className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6">
            <header className="flex items-center justify-between">
              <h2 className="text-base font-semibold capitalize text-foreground">{r.mes}</h2>
              <span className="text-xs text-text-muted">{r.creadaEn}</span>
            </header>

            <Seccion titulo="Resultados">
              <p><b>Cumplidos:</b> {r.resultados.objetivosCumplidos.join(", ") || "—"}</p>
              <p><b>No cumplidos:</b> {r.resultados.objetivosNoCumplidos.join(", ") || "—"}</p>
              <p><b>Avanzó:</b> {r.resultados.queAvanzo || "—"}</p>
              <p><b>Se estancó:</b> {r.resultados.queSeEstanco || "—"}</p>
              <p><b>Consistencia de hábitos:</b> {r.resultados.indiceConsistenciaHabitos}%</p>
              <p><b>Ingresos vs objetivo:</b> {r.resultados.ingresosVsObjetivo || "—"}</p>
              <p><b>Gastos vs presupuesto:</b> {r.resultados.gastosVsPresupuesto || "—"}</p>
            </Seccion>

            <Seccion titulo="Aprendizajes">
              <p><b>Funcionó:</b> {r.aprendizajes.queFunciono || "—"}</p>
              <p><b>No funcionó:</b> {r.aprendizajes.queNoFunciono || "—"}</p>
              <p><b>Cambiarías:</b> {r.aprendizajes.queCambiarias || "—"}</p>
              <p><b>Descubriste:</b> {r.aprendizajes.queDescubriste || "—"}</p>
            </Seccion>

            <Seccion titulo="Ajuste de curso">
              <p>{r.ajusteDeCurso.objetivosAModificar || "—"}</p>
              <p>{r.ajusteDeCurso.habitosAAjustar || "—"}</p>
              <p>{r.ajusteDeCurso.prioridadesQueCambiaron || "—"}</p>
            </Seccion>

            <Seccion titulo="Intención del próximo mes">
              <p className="text-base font-medium text-primary">{r.intencionProximoMes.palabraDelMes}</p>
              <p>{r.intencionProximoMes.objetivosPrincipales.join(" · ")}</p>
              <p>{r.intencionProximoMes.queNecesitasDiferente}</p>
            </Seccion>
          </article>
        ))}
      </div>
    </div>
  );
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold text-foreground">{titulo}</span>
      {children}
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{titulo}</span>
      <div className="flex flex-col gap-0.5 text-sm text-text-secondary">{children}</div>
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
