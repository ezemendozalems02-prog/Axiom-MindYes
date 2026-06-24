import {
  LayoutDashboard,
  CheckSquare,
  Brain,
  Sparkles,
  Compass,
  Briefcase,
  Wallet,
  BrainCircuit,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const pilares: NavItem[] = [
  { title: "Centro de Control", href: "/centro-de-control", icon: LayoutDashboard },
  { title: "Acción", href: "/accion", icon: CheckSquare },
  { title: "Mente", href: "/mente", icon: Brain },
  { title: "Identidad", href: "/identidad", icon: Sparkles },
  { title: "Dirección", href: "/direccion", icon: Compass },
  { title: "Negocio", href: "/negocio", icon: Briefcase },
  { title: "Finanzas", href: "/finanzas", icon: Wallet },
  { title: "Inteligencia", href: "/inteligencia", icon: BrainCircuit },
];
