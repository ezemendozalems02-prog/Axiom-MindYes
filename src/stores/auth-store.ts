import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthStore = {
  isAuthenticated: boolean;
  nombre: string;
  email: string;
  password: string;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  actualizarCuenta: (cambios: { nombre?: string; email?: string }) => void;
  cambiarPassword: (actual: string, nueva: string) => boolean;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      nombre: "Neo",
      email: "ezemendozalems02@gmail.com",
      password: "hola1234@",

      login: (email, password) => {
        const ok = get().email.toLowerCase() === email.trim().toLowerCase() && get().password === password;
        if (ok) set({ isAuthenticated: true });
        return ok;
      },

      logout: () => set({ isAuthenticated: false }),

      actualizarCuenta: (cambios) => set((state) => ({ ...state, ...cambios })),

      cambiarPassword: (actual, nueva) => {
        if (get().password !== actual) return false;
        set({ password: nueva });
        return true;
      },
    }),
    { name: "axiom-mind-auth" }
  )
);
