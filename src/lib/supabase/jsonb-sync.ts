import { crearClienteSupabaseBrowser } from "@/lib/supabase/client";

/**
 * Sync genérico para módulos que se leen/escriben siempre completos
 * (Dirección, Identidad, Negocio, Mente, Finanzas): cada tabla tiene
 * un único row por user_id con el estado completo en columnas jsonb.
 */
export function crearSyncJSON<T extends Record<string, unknown>>(tabla: string) {
  async function cargar(): Promise<T | null> {
    const supabase = crearClienteSupabaseBrowser();
    const { data: sesion } = await supabase.auth.getSession();
    if (!sesion.session) return null;

    const { data, error } = await supabase
      .from(tabla)
      .select("*")
      .eq("user_id", sesion.session.user.id)
      .maybeSingle();

    if (error) {
      console.warn(`Error cargando ${tabla} desde Supabase:`, error);
      return null;
    }
    return (data as T) ?? null;
  }

  async function guardar(datos: T): Promise<void> {
    const supabase = crearClienteSupabaseBrowser();
    const { data: sesion } = await supabase.auth.getSession();
    if (!sesion.session) return;

    const { error } = await supabase
      .from(tabla)
      .upsert({ ...datos, user_id: sesion.session.user.id, updated_at: new Date().toISOString() });

    if (error) console.warn(`Error guardando ${tabla} en Supabase:`, error);
  }

  return { cargar, guardar };
}
