-- ============================================================
-- ETAPA 1 (cont.): campos que faltaban en tareas para reflejar
-- el modelo completo de la app (recurrencia, delegación).
-- Pegar y ejecutar en el SQL Editor de Supabase.
-- ============================================================

alter table public.tareas
  add column if not exists recurrencia text,
  add column if not exists delegacion jsonb;
