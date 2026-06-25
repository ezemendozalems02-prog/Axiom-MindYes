"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCommandPaletteStore } from "@/stores/command-palette-store";
import { useResultadosBusqueda } from "@/hooks/use-resultados-busqueda";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function CommandPalette() {
  const open = useCommandPaletteStore((s) => s.open);
  const setOpen = useCommandPaletteStore((s) => s.setOpen);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const resultados = useResultadosBusqueda(query);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const esAtajo = (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "f");
      if (esAtajo) {
        e.preventDefault();
        setOpen(!open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  function ir(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const grupos = Object.entries(resultados);
  const totalResultados = grupos.reduce((acc, [, items]) => acc + items.length, 0);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Búsqueda universal"
      description="Buscá en proyectos, clientes, tareas, ideas, notas, decisiones, insights y revisiones"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Buscar en todo Axiom Mind…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {totalResultados === 0 && <CommandEmpty>Sin resultados.</CommandEmpty>}
          {grupos.map(([tipo, items]) => (
            <CommandGroup key={tipo} heading={tipo}>
              {items.slice(0, 6).map((item) => (
                <CommandItem
                  key={`${item.tipo}-${item.id}`}
                  value={`${item.tipo}-${item.id}-${item.titulo}`}
                  onSelect={() => ir(item.href)}
                >
                  <div className="flex flex-col">
                    <span>{item.titulo}</span>
                    {item.subtitulo && (
                      <span className="text-xs text-text-muted">{item.subtitulo}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
