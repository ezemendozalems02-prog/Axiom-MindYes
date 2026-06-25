"use client";

import { useState } from "react";
import { Pencil, Check } from "lucide-react";

import { useDireccionStore } from "@/stores/direccion-store";
import { Textarea } from "@/components/ui/textarea";

function Campo({
  label,
  valor,
  onGuardar,
  multilinea = false,
  placeholder,
}: {
  label: string;
  valor: string;
  onGuardar: (v: string) => void;
  multilinea?: boolean;
  placeholder?: string;
}) {
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState(valor);

  function guardar() {
    onGuardar(borrador);
    setEditando(false);
  }

  return (
    <div className="group flex flex-col gap-3">
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
        {label}
      </span>
      {editando ? (
        <div className="flex flex-col gap-3">
          <Textarea
            autoFocus
            value={borrador}
            onChange={(e) => setBorrador(e.target.value)}
            rows={multilinea ? 6 : 2}
            placeholder={placeholder}
            className="border-none bg-transparent px-0 text-2xl leading-relaxed text-foreground shadow-none placeholder:text-text-muted/60 focus-visible:ring-0"
          />
          <button
            onClick={guardar}
            className="flex w-fit items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Check className="size-3.5" />
            Guardar
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setBorrador(valor);
            setEditando(true);
          }}
          className="flex items-start gap-2 text-left"
        >
          <span
            className={`text-2xl font-light leading-relaxed ${
              valor ? "text-foreground" : "text-text-muted/60"
            }`}
          >
            {valor || placeholder}
          </span>
          <Pencil className="mt-2 size-3.5 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      )}
    </div>
  );
}

export default function VisionPage() {
  const vision = useDireccionStore((s) => s.vision);
  const actualizarVision = useDireccionStore((s) => s.actualizarVision);
  const [nuevoValor, setNuevoValor] = useState("");

  function agregarValor() {
    const v = nuevoValor.trim();
    if (!v) return;
    actualizarVision({ valores: [...vision.valores, v] });
    setNuevoValor("");
  }

  function quitarValor(v: string) {
    actualizarVision({ valores: vision.valores.filter((x) => x !== v) });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-16 px-8 py-20">
      <Campo
        label="Visión a 5–10 años"
        valor={vision.vision}
        multilinea
        placeholder="Ej: En los próximos 10 años quiero haber construido algo que me dé libertad de tiempo real, no solo libertad financiera…"
        onGuardar={(v) => actualizarVision({ vision: v })}
      />

      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
          Valores fundamentales
        </span>
        <div className="flex flex-wrap gap-2">
          {vision.valores.map((v) => (
            <button
              key={v}
              onClick={() => quitarValor(v)}
              className="rounded-full border border-border px-4 py-1.5 text-sm text-text-secondary transition-colors hover:border-destructive/40 hover:text-destructive"
              title="Click para quitar"
            >
              {v}
            </button>
          ))}
        </div>
        <input
          value={nuevoValor}
          onChange={(e) => setNuevoValor(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregarValor()}
          placeholder="Agregar un valor y presionar Enter…"
          className="mt-1 w-fit border-b border-border bg-transparent py-1 text-sm text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
      </div>

      <Campo
        label="Propósito declarado"
        valor={vision.proposito}
        placeholder="Ej: Construir cosas que funcionen bien y le devuelvan tiempo a la gente."
        onGuardar={(v) => actualizarVision({ proposito: v })}
      />

      <Campo
        label="Identidad futura"
        valor={vision.identidadFutura}
        multilinea
        placeholder="Ej: En 10 años seré alguien que…"
        onGuardar={(v) => actualizarVision({ identidadFutura: v })}
      />

      <p className="text-xs text-text-muted">
        Actualizado el {vision.actualizadoEn}. Esta carta alimenta los insights de toda la app.
      </p>
    </div>
  );
}
