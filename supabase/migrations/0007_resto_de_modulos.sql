-- ============================================================
-- Migra Dirección, Negocio, Identidad, Mente y Finanzas a Supabase.
-- Cada módulo guarda su estado completo como JSON por usuario (un
-- único row por user_id) — mismo patrón de aislamiento RLS que
-- proyectos/tareas, pero sin relacional completo porque estos
-- módulos siempre se leen/escriben enteros, no por entidad suelta.
-- Pegar y ejecutar en el SQL Editor de Supabase.
-- ============================================================

create table if not exists public.direccion_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  vision jsonb not null default '{}',
  objetivos jsonb not null default '[]',
  metas jsonb not null default '[]',
  planes_semanales jsonb not null default '[]',
  revisiones_mensuales jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table if not exists public.identidad_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  habitos jsonb not null default '[]',
  rutinas jsonb not null default '[]',
  revisiones jsonb not null default '[]',
  estado_hoy jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.negocio_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  clientes jsonb not null default '[]',
  oportunidades jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table if not exists public.mente_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  bandeja jsonb not null default '[]',
  ideas jsonb not null default '[]',
  decisiones jsonb not null default '[]',
  notas jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table if not exists public.finanzas_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ingresos jsonb not null default '[]',
  gastos jsonb not null default '[]',
  deudas jsonb not null default '[]',
  objetivos jsonb not null default '{}',
  patrimonio jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

do $$
declare
  t text;
begin
  foreach t in array array['direccion_data', 'identidad_data', 'negocio_data', 'mente_data', 'finanzas_data']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "usuario gestiona su propio %1$s" on public.%1$s for all using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t
    );
    execute format(
      'create policy "superadmin ve %1$s" on public.%1$s for select using (public.es_superadmin())',
      t
    );
  end loop;
end $$;
