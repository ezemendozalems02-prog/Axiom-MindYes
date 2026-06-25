"use client";

import { Sparkles } from "lucide-react";

import { useInteligenciaStore } from "@/stores/inteligencia-store";
import { useGenerarAnalisisSemanal } from "@/hooks/use-generar-analisis-semanal";
import { Button } from "@/components/ui/button";

export default function AnalisisSemanalPage() {
  const analisisSemanal = useInteligenciaStore((s) => s.analisisSemanal);
  const generar = useGenerarAnalisisSemanal();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-8 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Análisis Semanal</h1>
        <p className="text-sm text-text-secondary">
          Se genera automáticamente cada domingo a la noche, o cuando completás una revisión
          semanal en Identidad. También podés generarlo manualmente.
        </p>
      </div>

      <Button onClick={generar} className="self-start">
        <Sparkles data-icon="inline-start" />
        Generar análisis semanal
      </Button>

      <div className="flex flex-col gap-4">
        {analisisSemanal.map((a) => (
          <div key={a.id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Semana del {a.semanaInicio} al {a.semanaFin}
              </span>
              <span className="text-xs text-text-muted">
                {new Date(a.creadoEn).toLocaleDateString("es-AR")}
              </span>
            </div>

            <p className="text-sm text-text-secondary">{a.resumen}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                  Logros
                </span>
                <ul className="flex flex-col gap-0.5">
                  {a.logros.map((l, i) => (
                    <li key={i} className="text-sm text-foreground">
                      · {l}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                  Áreas que necesitan atención
                </span>
                <ul className="flex flex-col gap-0.5">
                  {a.areasAtencion.map((l, i) => (
                    <li key={i} className="text-sm text-foreground">
                      · {l}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                  Patrones detectados
                </span>
                <ul className="flex flex-col gap-0.5">
                  {a.patrones.map((l, i) => (
                    <li key={i} className="text-sm text-foreground">
                      · {l}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                  Recomendaciones
                </span>
                <ul className="flex flex-col gap-0.5">
                  {a.recomendaciones.map((l, i) => (
                    <li key={i} className="text-sm text-foreground">
                      · {l}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}

        {analisisSemanal.length === 0 && (
          <p className="text-sm text-text-muted">
            Todavía no generaste ningún análisis semanal.
          </p>
        )}
      </div>
    </div>
  );
}
