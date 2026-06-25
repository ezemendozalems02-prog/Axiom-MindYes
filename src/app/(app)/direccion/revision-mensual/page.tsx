"use client";

import { useState } from "react";

import type { RevisionMensual } from "@/types/direccion";
import { useDireccionStore } from "@/stores/direccion-store";
import { useIdentidadStore } from "@/stores/identidad-store";
import { useFinanzasStore } from "@/stores/finanzas-store";
import { calcularProgresoObjetivo } from "@/lib/direccion";
import { mesDe, sumarGastosDelMes, sumarIngresosDelMes } from "@/lib/finanzas";
import { getHoyISO } from "@/lib/hoy";

function mesActualLabel(): string {
  const hoy = new Date(getHoyISO() + "T00:00:00");
  return hoy.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

export default function RevisionMensualPage() {
  const revisiones = useDireccionStore((s) => s.revisionesMensuales);
  const agregarRevisionMensual = useDireccionStore((s) => s.agregarRevisionMensual);
  const objetivos = useDireccionStore((s) => s.objetivos);
  const metas = useDireccionStore((s) => s.metas);
  const indiceConsistenciaHabitos = useIdentidadStore((s) => s.indiceConsistenciaGlobal());
  const ingresos = useFinanzasStore((s) => s.ingresos);
  const gastos = useFinanzasStore((s) => s.gastos);
  const objetivosFinancieros = useFinanzasStore((s) => s.objetivos);
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

  function calcularResultadosDelMes() {
    const hoy = getHoyISO();
    const mes = mesDe(hoy);
    const activos = objetivos.filter((o) => o.estado === "Activo");
    const conProgreso = activos
      .map((o) => ({ o, progreso: calcularProgresoObjetivo(o.id, objetivos, metas) }))
      .sort((a, b) => b.progreso - a.progreso);

    const ingresosMes = sumarIngresosDelMes(ingresos, mes);
    const gastosMes = sumarGastosDelMes(gastos, mes);
    const target = objetivosFinancieros.ingresoMensualTarget;
    const ahorroMes = ingresosMes - gastosMes;

    return {
      objetivosCumplidos: objetivos.filter((o) => o.estado === "Cumplido").map((o) => o.titulo),
      objetivosNoCumplidos: objetivos
        .filter((o) => o.estado === "Pospuesto" || o.estado === "Abandonado")
        .map((o) => o.titulo),
      queAvanzo: conProgreso[0]
        ? `"${conProgreso[0].o.titulo}" (${conProgreso[0].progreso}% de avance)`
        : "Sin objetivos activos este mes.",
      queSeEstanco: conProgreso.length > 1 && conProgreso[conProgreso.length - 1].progreso < 50
        ? `"${conProgreso[conProgreso.length - 1].o.titulo}" (${conProgreso[conProgreso.length - 1].progreso}% de avance)`
        : "Sin estancamientos relevantes este mes.",
      indiceConsistenciaHabitos: Math.round(indiceConsistenciaHabitos),
      ingresosVsObjetivo: target > 0
        ? `$${ingresosMes.toLocaleString("es-AR")} de $${target.toLocaleString("es-AR")} (${Math.round((ingresosMes / target) * 100)}%)`
        : `$${ingresosMes.toLocaleString("es-AR")} ingresados, sin objetivo mensual definido.`,
      gastosVsPresupuesto: `Gastaste $${gastosMes.toLocaleString("es-AR")} este mes, ahorrando $${ahorroMes.toLocaleString("es-AR")} (objetivo de ahorro: $${objetivosFinancieros.ahorroMensualTarget.toLocaleString("es-AR")}).`,
    };
  }

  function guardar() {
    const revision: RevisionMensual = {
      id: `rm-${Date.now()}`,
      mes: getHoyISO().slice(0, 7),
      resultados: calcularResultadosDelMes(),
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
    <div className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-6 sm:px-8 sm:py-10">
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
          <Bloque titulo="Resultados del mes (calculado automáticamente)">
            <ResultadosAuto resultados={calcularResultadosDelMes()} />
          </Bloque>

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

function ResultadosAuto({ resultados }: { resultados: RevisionMensual["resultados"] }) {
  return (
    <div className="flex flex-col gap-1.5 text-sm text-text-secondary">
      <p><b>Avanzó:</b> {resultados.queAvanzo}</p>
      <p><b>Se estancó:</b> {resultados.queSeEstanco}</p>
      <p><b>Objetivos cumplidos:</b> {resultados.objetivosCumplidos.join(", ") || "—"}</p>
      <p><b>Objetivos no cumplidos:</b> {resultados.objetivosNoCumplidos.join(", ") || "—"}</p>
      <p><b>Consistencia de hábitos:</b> {resultados.indiceConsistenciaHabitos}%</p>
      <p><b>Ingresos vs objetivo:</b> {resultados.ingresosVsObjetivo}</p>
      <p><b>Gastos:</b> {resultados.gastosVsPresupuesto}</p>
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
