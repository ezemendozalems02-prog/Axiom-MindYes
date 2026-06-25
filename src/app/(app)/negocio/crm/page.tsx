"use client";

import { useState } from "react";
import { AlertTriangle, Mail, Phone, Plus, Pencil } from "lucide-react";

import type { Cliente } from "@/types/negocio";
import { useNegocioStore } from "@/stores/negocio-store";
import { useAccionStore } from "@/stores/accion-store";
import { useFinanzasStore } from "@/stores/finanzas-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormDialog, type CampoForm } from "@/components/ui/form-dialog";
import { getHoyISO } from "@/lib/hoy";
import { cn } from "@/lib/utils";

const CAMPOS: CampoForm[] = [
  { key: "nombre", label: "Nombre", type: "text" },
  { key: "empresa", label: "Empresa", type: "text" },
  { key: "sector", label: "Sector", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "telefono", label: "Teléfono", type: "text" },
  { key: "estado", label: "Estado", type: "select", opciones: ["Prospecto", "Activo", "Pausado", "Inactivo", "VIP"] },
  { key: "proximaAccion", label: "Próxima acción", type: "text" },
  { key: "proximaAccionFecha", label: "Fecha de la próxima acción", type: "date" },
];

const ESTADO_COLOR: Record<string, string> = {
  Prospecto: "bg-primary/15 text-primary",
  Activo: "bg-success/15 text-success",
  Pausado: "bg-warning/15 text-warning",
  Inactivo: "bg-muted text-text-muted",
  VIP: "bg-warning/20 text-warning",
};

const DIAS_SIN_SEGUIMIENTO = 14;

function diasDesde(fechaISO: string): number {
  const hoy = new Date(getHoyISO() + "T00:00:00");
  const desde = new Date(fechaISO + "T00:00:00");
  return Math.round((hoy.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CRMPage() {
  const clientes = useNegocioStore((s) => s.clientes);
  const registrarReunion = useNegocioStore((s) => s.registrarReunion);
  const registrarPropuesta = useNegocioStore((s) => s.registrarPropuesta);
  const agregarCliente = useNegocioStore((s) => s.agregarCliente);
  const actualizarCliente = useNegocioStore((s) => s.actualizarCliente);
  const proyectos = useAccionStore((s) => s.proyectos);
  const ingresos = useFinanzasStore((s) => s.ingresos);

  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);

  const filtrados = clientes.filter((c) => !filtroEstado || c.estado === filtroEstado);

  function abrirNuevo() {
    setEditando(null);
    setDialogAbierto(true);
  }

  function abrirEditar(c: Cliente) {
    setEditando(c);
    setDialogAbierto(true);
  }

  function guardar(valores: Record<string, unknown>) {
    const datos = {
      nombre: String(valores.nombre),
      empresa: String(valores.empresa),
      sector: String(valores.sector),
      email: String(valores.email),
      telefono: String(valores.telefono),
      estado: valores.estado as Cliente["estado"],
      proximaAccion: valores.proximaAccion ? String(valores.proximaAccion) : undefined,
      proximaAccionFecha: (valores.proximaAccionFecha as string) || null,
    };
    if (editando) {
      actualizarCliente(editando.id, datos);
    } else {
      agregarCliente({
        id: crypto.randomUUID(),
        ...datos,
        notas: [],
        archivos: [],
        reunionesRegistradas: 0,
        propuestasEnviadas: 0,
        ultimaInteraccion: getHoyISO(),
        creadoEn: getHoyISO(),
      });
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">CRM de Clientes</h1>
          <p className="text-sm text-text-secondary">{clientes.length} clientes</p>
        </div>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="ml-auto h-8 rounded-md border border-border bg-popover px-2 text-xs text-foreground"
        >
          <option value="">Todos los estados</option>
          {["Prospecto", "Activo", "Pausado", "Inactivo", "VIP"].map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>

        <Button size="sm" onClick={abrirNuevo}>
          <Plus data-icon="inline-start" />
          Nuevo Cliente
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {filtrados.map((cliente) => {
          const proyectosCliente = proyectos.filter((p) => p.clienteId === cliente.id);
          const ingresosCliente = ingresos
            .filter((i) => i.clienteId === cliente.id && i.estado !== "Pendiente")
            .reduce((acc, i) => acc + i.monto, 0);
          const dias = diasDesde(cliente.ultimaInteraccion);
          const sinSeguimiento = dias >= DIAS_SIN_SEGUIMIENTO;

          return (
            <div
              key={cliente.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-foreground">
                      {cliente.nombre}
                    </span>
                    <Badge className={cn(ESTADO_COLOR[cliente.estado])}>
                      {cliente.estado}
                    </Badge>
                    {sinSeguimiento && (
                      <Badge className="bg-destructive/15 text-destructive">
                        <AlertTriangle data-icon="inline-start" />
                        {dias} días sin seguimiento
                      </Badge>
                    )}
                    <button
                      onClick={() => abrirEditar(cliente)}
                      className="text-text-muted hover:text-foreground"
                      aria-label="Editar cliente"
                    >
                      <Pencil className="size-3" />
                    </button>
                  </div>
                  <span className="text-xs text-text-muted">
                    {cliente.empresa} · {cliente.sector}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <Mail className="size-3.5" /> {cliente.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="size-3.5" /> {cliente.telefono}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm sm:grid-cols-4">
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted">Ingresos generados</span>
                  <span className="font-medium text-foreground">
                    ${ingresosCliente.toLocaleString("es-AR")}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted">Proyectos</span>
                  <span className="font-medium text-foreground">{proyectosCliente.length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted">Reuniones</span>
                  <span className="font-medium text-foreground">
                    {cliente.reunionesRegistradas}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted">Propuestas</span>
                  <span className="font-medium text-foreground">
                    {cliente.propuestasEnviadas}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-text-secondary">
                  {cliente.proximaAccion
                    ? `Próxima acción: ${cliente.proximaAccion}${
                        cliente.proximaAccionFecha ? ` · ${cliente.proximaAccionFecha}` : ""
                      }`
                    : "Sin próxima acción definida"}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => registrarReunion(cliente.id)}
                  >
                    + Reunión
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => registrarPropuesta(cliente.id)}
                  >
                    + Propuesta
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <FormDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        title={editando ? "Editar cliente" : "Nuevo cliente"}
        campos={CAMPOS}
        datosIniciales={editando ?? undefined}
        onGuardar={guardar}
        submitLabel={editando ? "Guardar cambios" : "Crear cliente"}
      />
    </div>
  );
}
