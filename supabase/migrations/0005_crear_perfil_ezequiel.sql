-- ============================================================
-- Tu cuenta se creó antes de que existiera el trigger handle_new_user,
-- así que nunca tuviste una fila en profiles. La creamos ahora directo,
-- ya como superadmin.
-- Pegar y ejecutar en el SQL Editor de Supabase.
-- ============================================================

insert into public.profiles (id, email, full_name, role, trial_ends_at)
select id, email, 'Ezequiel', 'superadmin', null
from auth.users
where email = 'ezemendozalems02@gmail.com'
on conflict (id) do update set role = 'superadmin';
