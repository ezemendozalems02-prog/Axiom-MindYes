import type { StateStorage } from "zustand/middleware";

export type CuentaId = "real" | "demo";

const CLAVE_CUENTA_ACTIVA = "axiom-mind-cuenta-activa";

export function getCuentaActiva(): CuentaId {
  if (typeof window === "undefined") return "real";
  return window.localStorage.getItem(CLAVE_CUENTA_ACTIVA) === "demo" ? "demo" : "real";
}

export function setCuentaActiva(cuenta: CuentaId): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLAVE_CUENTA_ACTIVA, cuenta);
}

/**
 * Storage de zustand que namespacea cada clave por la cuenta activa (real | demo),
 * para que cada cuenta tenga sus propios datos aislados en localStorage —
 * loguearse como una no pisa ni mezcla los datos de la otra.
 */
export function crearStorageScopedPorCuenta(): StateStorage {
  return {
    getItem: (name) => {
      if (typeof window === "undefined") return null;
      return window.localStorage.getItem(`${name}::${getCuentaActiva()}`);
    },
    setItem: (name, value) => {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(`${name}::${getCuentaActiva()}`, value);
    },
    removeItem: (name) => {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(`${name}::${getCuentaActiva()}`);
    },
  };
}
