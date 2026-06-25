"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export type OpcionRef = { value: string; label: string };

export type CampoForm =
  | { key: string; label: string; type: "text"; placeholder?: string }
  | { key: string; label: string; type: "textarea"; placeholder?: string }
  | { key: string; label: string; type: "number"; placeholder?: string }
  | { key: string; label: string; type: "date" }
  | { key: string; label: string; type: "time" }
  | { key: string; label: string; type: "select"; opciones: string[] }
  | { key: string; label: string; type: "select-ref"; opciones: OpcionRef[]; vacio?: string }
  | { key: string; label: string; type: "tags"; placeholder?: string }
  | { key: string; label: string; type: "checklist"; opciones: OpcionRef[] };

type Valores = Record<string, string | string[]>;

function valoresIniciales(campos: CampoForm[], datos?: Record<string, unknown>): Valores {
  const v: Valores = {};
  for (const c of campos) {
    const raw = datos?.[c.key];
    if (c.type === "checklist") {
      v[c.key] = Array.isArray(raw) ? (raw as string[]) : [];
    } else if (raw === undefined || raw === null) {
      v[c.key] = c.type === "select" ? c.opciones[0] ?? "" : "";
    } else if (c.type === "tags" && Array.isArray(raw)) {
      v[c.key] = raw.join(", ");
    } else {
      v[c.key] = String(raw);
    }
  }
  return v;
}

export function convertirValores(campos: CampoForm[], valores: Valores): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const c of campos) {
    const raw = valores[c.key] ?? (c.type === "checklist" ? [] : "");
    if (c.type === "checklist") {
      out[c.key] = raw;
    } else if (c.type === "number") {
      out[c.key] = Number(raw) || 0;
    } else if (c.type === "tags") {
      out[c.key] = String(raw)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (c.type === "date" || c.type === "select-ref") {
      out[c.key] = raw || null;
    } else {
      out[c.key] = raw;
    }
  }
  return out;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  campos,
  datosIniciales,
  onGuardar,
  onEliminar,
  submitLabel = "Guardar",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  campos: CampoForm[];
  datosIniciales?: Record<string, unknown>;
  onGuardar: (valores: Record<string, unknown>) => void;
  onEliminar?: () => void;
  submitLabel?: string;
}) {
  const [valores, setValores] = useState<Valores>(() => valoresIniciales(campos, datosIniciales));

  useEffect(() => {
    if (open) setValores(valoresIniciales(campos, datosIniciales));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, datosIniciales]);

  function set(key: string, value: string | string[]) {
    setValores((v) => ({ ...v, [key]: value }));
  }

  function toggleChecklist(key: string, value: string) {
    setValores((v) => {
      const actual = Array.isArray(v[key]) ? (v[key] as string[]) : [];
      const next = actual.includes(value) ? actual.filter((x) => x !== value) : [...actual, value];
      return { ...v, [key]: next };
    });
  }

  function guardar() {
    onGuardar(convertirValores(campos, valores));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          {campos.map((c) => (
            <div key={c.key} className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary">{c.label}</label>
              {c.type === "textarea" ? (
                <Textarea
                  rows={3}
                  value={(valores[c.key] as string) ?? ""}
                  onChange={(e) => set(c.key, e.target.value)}
                  placeholder={c.placeholder}
                />
              ) : c.type === "select" ? (
                <select
                  value={(valores[c.key] as string) ?? ""}
                  onChange={(e) => set(c.key, e.target.value)}
                  className="h-9 rounded-md border border-border bg-popover px-2.5 text-sm text-foreground"
                >
                  {c.opciones.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : c.type === "select-ref" ? (
                <select
                  value={(valores[c.key] as string) ?? ""}
                  onChange={(e) => set(c.key, e.target.value)}
                  className="h-9 rounded-md border border-border bg-popover px-2.5 text-sm text-foreground"
                >
                  <option value="">{c.vacio ?? "Sin asignar"}</option>
                  {c.opciones.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : c.type === "checklist" ? (
                <div className="flex flex-wrap gap-1.5">
                  {c.opciones.map((o) => {
                    const seleccionado = ((valores[c.key] as string[]) ?? []).includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => toggleChecklist(c.key, o.value)}
                        className={`rounded-full border px-2.5 py-1 text-xs ${
                          seleccionado
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-text-secondary hover:text-foreground"
                        }`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                  {c.opciones.length === 0 && (
                    <span className="text-xs text-text-muted">Sin opciones disponibles.</span>
                  )}
                </div>
              ) : (
                <Input
                  type={
                    c.type === "number"
                      ? "number"
                      : c.type === "date"
                        ? "date"
                        : c.type === "time"
                          ? "time"
                          : "text"
                  }
                  value={(valores[c.key] as string) ?? ""}
                  onChange={(e) => set(c.key, e.target.value)}
                  placeholder={c.type === "text" || c.type === "number" ? c.placeholder : undefined}
                />
              )}
            </div>
          ))}
        </div>

        <DialogFooter className="items-center justify-between sm:justify-between">
          {onEliminar ? (
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                onEliminar();
                onOpenChange(false);
              }}
            >
              Eliminar
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={guardar}>{submitLabel}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
