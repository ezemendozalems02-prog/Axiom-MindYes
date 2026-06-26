export type RolPerfil = "user" | "admin" | "superadmin";

export type Perfil = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: RolPerfil;
  onboarding_completed: boolean;
  last_seen_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Plan = {
  id: string;
  nombre: string;
  precio_mensual: number;
  limite_proyectos: number | null;
  limite_tareas: number | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type TipoComunicado = "info" | "warning" | "critico";

export type Comunicado = {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: TipoComunicado;
  activo: boolean;
  created_at: string;
  created_by: string | null;
};
