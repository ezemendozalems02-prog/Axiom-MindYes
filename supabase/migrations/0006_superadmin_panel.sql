-- ============================================================
-- Base para el panel /superadmin: planes, comunicados, config
-- global, y permisos de superadmin sobre profiles/proyectos/tareas.
-- Pegar y ejecutar en el SQL Editor de Supabase.
-- ============================================================

-- Helper: ¿el usuario autenticado actual es superadmin?
create or replace function public.es_superadmin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'superadmin'
  );
$$ language sql security definer stable set search_path = public;

-- El superadmin sí puede cambiar role/trial_ends_at de cualquiera
-- (la protección original solo dejaba pasar a service_role).
create or replace function public.proteger_campos_admin()
returns trigger as $$
begin
  if auth.role() <> 'service_role' and not public.es_superadmin() then
    new.role := old.role;
    new.trial_ends_at := old.trial_ends_at;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 1. PLANES --------------------------------------------------
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  precio_mensual numeric not null default 0,
  limite_proyectos integer,
  limite_tareas integer,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.plans enable row level security;

create policy "cualquiera ve planes activos"
  on public.plans for select
  using (true);

create policy "superadmin gestiona planes"
  on public.plans for all
  using (public.es_superadmin())
  with check (public.es_superadmin());

-- 2. COMUNICADOS ------------------------------------------------
create table if not exists public.system_announcements (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  mensaje text not null,
  tipo text not null default 'info' check (tipo in ('info', 'warning', 'critico')),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

alter table public.system_announcements enable row level security;

create policy "cualquiera ve comunicados activos"
  on public.system_announcements for select
  using (true);

create policy "superadmin gestiona comunicados"
  on public.system_announcements for all
  using (public.es_superadmin())
  with check (public.es_superadmin());

-- 3. CONFIG GLOBAL ----------------------------------------------
create table if not exists public.system_config (
  clave text primary key,
  valor jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.system_config enable row level security;

create policy "cualquiera lee config"
  on public.system_config for select
  using (true);

create policy "superadmin gestiona config"
  on public.system_config for all
  using (public.es_superadmin())
  with check (public.es_superadmin());

insert into public.system_config (clave, valor) values
  ('signups_habilitados', 'true'),
  ('modo_mantenimiento', 'false')
on conflict (clave) do nothing;

-- 4. PERMISOS DE SUPERADMIN sobre profiles/proyectos/tareas ------
create policy "superadmin ve y edita todos los perfiles"
  on public.profiles for all
  using (public.es_superadmin())
  with check (public.es_superadmin());

create policy "superadmin ve todos los proyectos"
  on public.proyectos for select
  using (public.es_superadmin());

create policy "superadmin ve todas las tareas"
  on public.tareas for select
  using (public.es_superadmin());
