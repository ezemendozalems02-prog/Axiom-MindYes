"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

import type { Meta, Objetivo } from "@/types/direccion";
import { hijosDe, calcularProgresoObjetivo } from "@/lib/direccion";
import { ObjetivoCard } from "@/components/direccion/objetivo-card";

export function ObjetivoNodo({
  objetivo,
  objetivos,
  metas = [],
  nivel = 0,
}: {
  objetivo: Objetivo;
  objetivos: Objetivo[];
  metas?: Meta[];
  nivel?: number;
}) {
  const hijos = hijosDe(objetivo.id, objetivos);
  const [abierto, setAbierto] = useState(nivel < 2);
  const progreso = calcularProgresoObjetivo(objetivo.id, objetivos, metas);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-2">
        {hijos.length > 0 ? (
          <button
            onClick={() => setAbierto(!abierto)}
            className="mt-3 shrink-0 text-text-muted hover:text-foreground"
          >
            <ChevronRight className={`size-3.5 transition-transform ${abierto ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <span className="mt-3 w-3.5 shrink-0" />
        )}
        <div className="flex-1">
          <ObjetivoCard objetivo={objetivo} objetivos={objetivos} metas={metas} compacto />
        </div>
        <span className="mt-3 w-10 shrink-0 text-right text-xs text-text-muted">{progreso}%</span>
      </div>
      {abierto && hijos.length > 0 && (
        <div className="ml-5 flex flex-col gap-2 border-l border-border pl-4">
          {hijos.map((h) => (
            <ObjetivoNodo key={h.id} objetivo={h} objetivos={objetivos} metas={metas} nivel={nivel + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
