"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth-store";
import { useCuentaMetaStore } from "@/stores/cuenta-meta-store";
import { aplicarSeedDemo } from "@/lib/demo/seed-demo-user";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const esCuentaDemo = useAuthStore((s) => s.esCuentaDemo);
  const seedDemoAplicado = useCuentaMetaStore((s) => s.seedDemoAplicado);
  const marcarSeedDemoAplicado = useCuentaMetaStore((s) => s.marcarSeedDemoAplicado);
  const [hidratado, setHidratado] = useState(false);

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

  if (!hidratado || !isAuthenticated) return null;

  return <>{children}</>;
}
