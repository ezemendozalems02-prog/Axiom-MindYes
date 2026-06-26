import { create } from "zustand";
import { persist } from "zustand/middleware";

import { setCuentaActiva } from "@/lib/storage-por-cuenta";
import { crearClienteSupabaseBrowser } from "@/lib/supabase/client";

export const DEMO_EMAIL = "demo@axiommind.app";
const DEMO_PASSWORD = "AxiomDemo2025!";
const DEMO_NOMBRE = "Matías Guerrero";

type AuthStore = {
  isAuthenticated: boolean;
  esCuentaDemo: boolean;
  nombreSesion: string;
  emailSesion: string;
  nombre: string;
  email: string;
  password: string;
  login: (email: string, password: string) => Promise<boolean>;
  registrarse: (email: string, password: string, nombre: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  actualizarCuenta: (cambios: { nombre?: string; email?: string }) => void;
  cambiarPassword: (actual: string, nueva: string) => boolean;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      esCuentaDemo: false,
      nombreSesion: "Neo",
      emailSesion: "ezemendozalems02@gmail.com",
      nombre: "Neo",
      email: "ezemendozalems02@gmail.com",
      password: "Hola1234@",

      login: async (email, password) => {
        const correo = email.trim().toLowerCase();

        if (correo === DEMO_EMAIL && password === DEMO_PASSWORD) {
          setCuentaActiva("demo");
          set({
            isAuthenticated: true,
            esCuentaDemo: true,
            nombreSesion: DEMO_NOMBRE,
            emailSesion: DEMO_EMAIL,
          });
          return true;
        }

        const supabase = crearClienteSupabaseBrowser();
        const { data, error } = await supabase.auth.signInWithPassword({ email: correo, password });
        if (error || !data.user) return false;

        setCuentaActiva(data.user.id);
        set({
          isAuthenticated: true,
          esCuentaDemo: false,
          nombreSesion: (data.user.user_metadata?.full_name as string) || get().nombre,
          emailSesion: correo,
        });
        return true;
      },

      registrarse: async (email, password, nombre) => {
        const correo = email.trim().toLowerCase();
        if (correo === DEMO_EMAIL) return { ok: false, error: "Ese email está reservado." };

        const supabase = crearClienteSupabaseBrowser();
        const { data, error } = await supabase.auth.signUp({
          email: correo,
          password,
          options: { data: { full_name: nombre.trim() } },
        });
        if (error) return { ok: false, error: error.message };
        if (!data.user) return { ok: false, error: "No se pudo crear la cuenta." };

        if (!data.session) {
          return {
            ok: false,
            error: "Cuenta creada. Confirmá tu email antes de iniciar sesión.",
          };
        }

        setCuentaActiva(data.user.id);
        set({
          isAuthenticated: true,
          esCuentaDemo: false,
          nombreSesion: nombre.trim(),
          emailSesion: correo,
        });
        return { ok: true };
      },

      logout: () => {
        crearClienteSupabaseBrowser().auth.signOut();
        set({ isAuthenticated: false, esCuentaDemo: false });
      },

      actualizarCuenta: (cambios) =>
        set((state) => {
          if (state.esCuentaDemo) return state;
          return {
            ...state,
            ...cambios,
            nombreSesion: cambios.nombre ?? state.nombreSesion,
            emailSesion: cambios.email ?? state.emailSesion,
          };
        }),

      cambiarPassword: (actual, nueva) => {
        if (get().esCuentaDemo) return false;
        if (get().password !== actual) return false;
        set({ password: nueva });
        return true;
      },
    }),
    { name: "axiom-mind-auth-v2" }
  )
);
