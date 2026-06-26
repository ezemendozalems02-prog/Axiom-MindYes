-- ============================================================
-- Trial de 14 días para cuentas nuevas.
-- Pegar y ejecutar en el SQL Editor de Supabase.
-- ============================================================

alter table public.profiles
  add column if not exists trial_ends_at timestamptz;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, trial_ends_at)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name', now() + interval '14 days');
  return new;
end;
$$ language plpgsql security definer set search_path = public;
