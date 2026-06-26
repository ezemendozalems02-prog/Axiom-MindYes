-- ============================================================
-- Protege las columnas role/trial_ends_at de profiles para que un
-- usuario no pueda auto-promoverse editando su propio perfil, y
-- marca la cuenta de Ezequiel como superadmin.
-- Pegar y ejecutar en el SQL Editor de Supabase.
-- ============================================================

create or replace function public.proteger_campos_admin()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    new.role := old.role;
    new.trial_ends_at := old.trial_ends_at;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists proteger_campos_admin on public.profiles;
create trigger proteger_campos_admin
  before update on public.profiles
  for each row execute function public.proteger_campos_admin();

update public.profiles
set role = 'superadmin'
where email = 'ezemendozalems02@gmail.com';
