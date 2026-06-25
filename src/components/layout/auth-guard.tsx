"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (hidratado && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hidratado, isAuthenticated, router]);

  if (!hidratado || !isAuthenticated) return null;

  return <>{children}</>;
}
