-- ============================================================
-- ETAPA 1: Perfiles + RLS + módulo Acción (piloto)
-- Pegar y ejecutar en el SQL Editor de tu proyecto Supabase
-- (Dashboard → SQL Editor → New query), de una sola vez.
-- ============================================================

-- 1. PROFILES -------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin', 'superadmin')),
  onboarding_completed boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "usuarios ven su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "usuarios actualizan su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Crea el perfil automáticamente cuando alguien se registra en auth.users.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. MÓDULO ACCIÓN (piloto) ------------------------------------
create table if not exists public.proyectos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  area text not null,
  tipo text not null check (tipo in ('Propio', 'Cliente')),
  cliente_id uuid,
  progreso integer not null default 0,
  fecha_limite date,
  estado text not null default 'en_curso' check (estado in ('en_curso', 'pausado', 'completado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tareas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  descripcion text,
  estado text not null default 'sin_empezar'
    check (estado in ('sin_empezar', 'en_progreso', 'bloqueado', 'completado', 'archivado')),
  prioridad text not null default 'Media' check (prioridad in ('Crítica', 'Alta', 'Media', 'Baja')),
  impacto text not null default 'Medio' check (impacto in ('Alto', 'Medio', 'Bajo')),
  urgencia text not null default 'Normal' check (urgencia in ('Alta', 'Normal')),
  energia text not null default 'Media' check (energia in ('Alta', 'Media', 'Baja')),
  tiempo_estimado_min integer not null default 0,
  tiempo_real_min integer not null default 0,
  proyecto_id uuid references public.proyectos(id) on delete set null,
  objetivo_id uuid,
  area text not null,
  etiquetas text[] not null default '{}',
  dependencias_ids uuid[] not null default '{}',
  fecha_limite date,
  fecha_programada date,
  notas text,
  bandeja boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.proyectos enable row level security;
alter table public.tareas enable row level security;

create policy "usuarios solo ven sus proyectos"
  on public.proyectos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "usuarios solo ven sus tareas"
  on public.tareas for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Mantener updated_at al día en cada modificación.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.proyectos;
create trigger set_updated_at before update on public.proyectos
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.tareas;
create trigger set_updated_at before update on public.tareas
  for each row execute function public.set_updated_at();
