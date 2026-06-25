"use client";

import { Eye, Link2, Layers, TrendingUp, Lightbulb } from "lucide-react";

import { useMotorInteligencia } from "@/hooks/use-motor-inteligencia";

const NIVELES = [
  { key: "observacion" as const, titulo: "Observación", icono: Eye, descripcion: "Recolecta datos de todos los módulos." },
  { key: "comprension" as const, titulo: "Comprensión", icono: Link2, descripcion: "Relaciona la información entre sí." },
  { key: "interpretacion" as const, titulo: "Interpretación", icono: Layers, descripcion: "Detecta patrones temporales." },
  { key: "prediccion" as const, titulo: "Predicción", icono: TrendingUp, descripcion: "Anticipa lo que puede pasar." },
];

export default function MotorPage() {
  const { niveles } = useMotorInteligencia();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Motor de Inteligencia</h1>
        <p className="text-sm text-text-secondary">
          Así razona Axiom Mind: 5 niveles, de la observación a la recomendación.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {NIVELES.map((nivel, i) => {
          const Icon = nivel.icono;
          const items = niveles[nivel.key];
          return (
            <div key={nivel.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Icon className="size-4" />
                </span>
                {i < NIVELES.length - 1 && <span className="mt-1 h-full w-px bg-border" />}
              </div>
              <div className="flex flex-1 flex-col gap-2 pb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-foreground">
                    Nivel {i + 1} — {nivel.titulo}
                  </span>
                  <span className="text-xs text-text-muted">{nivel.descripcion}</span>
                </div>
                <ul className="flex flex-col gap-1">
                  {items.map((texto, idx) => (
                    <li key={idx} className="text-sm text-text-secondary">
                      {texto}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}

        <div className="flex gap-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
            <Lightbulb className="size-4" />
          </span>
          <div className="flex flex-1 flex-col gap-2">
            <span className="text-sm font-medium text-foreground">
              Nivel 5 — Recomendación
            </span>
            <ul className="flex flex-col gap-1">
              {niveles.recomendacion.map((r) => (
                <li key={r.id} className="text-sm text-text-secondary">
                  {r.texto}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
