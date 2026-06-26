"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth-store";
import { useCuentaMetaStore } from "@/stores/cuenta-meta-store";
import { useAccionStore } from "@/stores/accion-store";
import { useDireccionStore } from "@/stores/direccion-store";
import { useIdentidadStore } from "@/stores/identidad-store";
import { useNegocioStore } from "@/stores/negocio-store";
import { useMenteStore } from "@/stores/mente-store";
import { useFinanzasStore } from "@/stores/finanzas-store";
import { aplicarSeedDemo } from "@/lib/demo/seed-demo-user";
import { crearClienteSupabaseBrowser } from "@/lib/supabase/client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const esCuentaDemo = useAuthStore((s) => s.esCuentaDemo);
  const seedDemoAplicado = useCuentaMetaStore((s) => s.seedDemoAplicado);
  const marcarSeedDemoAplicado = useCuentaMetaStore((s) => s.marcarSeedDemoAplicado);
  const [hidratado, setHidratado] = useState(false);
  const [onboardingChecado, setOnboardingChecado] = useState(false);
  const [necesitaOnboarding, setNecesitaOnboarding] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (hidratado && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hidratado, isAuthenticated, router]);

  useEffect(() => {
    if (hidratado && isAuthenticated && esCuentaDemo && !seedDemoAplicado) {
      aplicarSeedDemo();
      marcarSeedDemoAplicado();
    }
  }, [hidratado, isAuthenticated, esCuentaDemo, seedDemoAplicado, marcarSeedDemoAplicado]);

  useEffect(() => {
    if (hidratado && isAuthenticated && !esCuentaDemo) {
      useAccionStore.getState().cargarDesdeSupabase();
      useDireccionStore.getState().cargarDesdeSupabase();
      useIdentidadStore.getState().cargarDesdeSupabase();
      useNegocioStore.getState().cargarDesdeSupabase();
      useMenteStore.getState().cargarDesdeSupabase();
      useFinanzasStore.getState().cargarDesdeSupabase();
    }
  }, [hidratado, isAuthenticated, esCuentaDemo]);

  useEffect(() => {
    if (!hidratado || !isAuthenticated || esCuentaDemo) {
      setOnboardingChecado(true);
      return;
    }
    let activo = true;
    (async () => {
      const supabase = crearClienteSupabaseBrowser();
      const { data: sesion } = await supabase.auth.getSession();
      if (!sesion.session) {
        if (activo) setOnboardingChecado(true);
        return;
      }
      const { data: perfil } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", sesion.session.user.id)
        .single();
      if (!activo) return;
      setNecesitaOnboarding(perfil ? !perfil.onboarding_completed : false);
      setOnboardingChecado(true);
    })();
    return () => { activo = false; };
  }, [hidratado, isAuthenticated, esCuentaDemo]);

  useEffect(() => {
    if (onboardingChecado && necesitaOnboarding) {
      router.replace("/onboarding");
    }
  }, [onboardingChecado, necesitaOnboarding, router]);

  if (!hidratado || !isAuthenticated || !onboardingChecado || necesitaOnboarding) return null;

  return <>{children}</>;
}
