const colorSwatches = [
  { name: "background", label: "bg-primary", className: "bg-background" },
  { name: "card", label: "bg-secondary", className: "bg-card" },
  { name: "popover", label: "bg-tertiary", className: "bg-popover" },
  { name: "primary", label: "accent (índigo)", className: "bg-primary" },
  { name: "success", label: "success", className: "bg-success" },
  { name: "warning", label: "warning", className: "bg-warning" },
  { name: "destructive", label: "error", className: "bg-destructive" },
];

const radii = [
  { name: "sm", label: "radius-sm · inputs", className: "rounded-sm" },
  { name: "md", label: "radius-md · tarjetas", className: "rounded-md" },
  { name: "lg", label: "radius-lg · paneles", className: "rounded-lg" },
];

const shadows = [
  { name: "xs", label: "shadow-xs", className: "shadow-xs" },
  { name: "sm", label: "shadow-sm", className: "shadow-sm" },
  { name: "md", label: "shadow-md", className: "shadow-md" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background px-8 py-16 sm:px-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-16">
        <header className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text-muted">
            Etapa 1 — Fundaciones
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Design Tokens
          </h1>
          <p className="max-w-lg text-base text-text-secondary">
            Vista previa del sistema de diseño base de Axiom Mind: colores,
            tipografía, espaciado, radios y sombras.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-foreground">Colores</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {colorSwatches.map((s) => (
              <div key={s.name} className="flex flex-col gap-2">
                <div
                  className={`h-20 rounded-md border border-border ${s.className}`}
                />
                <span className="text-sm text-text-secondary">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Tipografía
          </h2>
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6">
            <p className="text-4xl font-bold text-foreground">
              Título principal
            </p>
            <p className="text-2xl font-medium text-foreground">Subtítulo</p>
            <p className="text-xl font-medium text-foreground">
              Título de tarjeta
            </p>
            <p className="text-base font-normal text-foreground">
              Texto de cuerpo — legible, cómodo, pensado para durar.
            </p>
            <p className="text-sm font-normal text-text-secondary">
              Información secundaria
            </p>
            <p className="text-sm font-normal text-text-muted">
              Información atenuada
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Espaciado
          </h2>
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6">
            {[1, 2, 3, 4, 6, 8, 12, 16, 24].map((unit) => (
              <div key={unit} className="flex items-center gap-4">
                <span className="w-16 text-sm text-text-secondary">
                  {unit * 4}px
                </span>
                <div
                  className="h-2 rounded-sm bg-primary"
                  style={{ width: `${unit * 4}px` }}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-foreground">Radios</h2>
          <div className="grid grid-cols-3 gap-4">
            {radii.map((r) => (
              <div key={r.name} className="flex flex-col gap-2">
                <div className={`h-20 bg-secondary ${r.className}`} />
                <span className="text-sm text-text-secondary">{r.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 pb-16">
          <h2 className="text-2xl font-semibold text-foreground">Sombras</h2>
          <div className="grid grid-cols-3 gap-6">
            {shadows.map((s) => (
              <div key={s.name} className="flex flex-col gap-3">
                <div
                  className={`h-20 rounded-md bg-card ${s.className}`}
                />
                <span className="text-sm text-text-secondary">{s.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
