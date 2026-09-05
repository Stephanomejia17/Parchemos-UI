import {
  BadgeCheck,
  BarChart3,
  Brain,
  CreditCard,
  Headphones,
  LayoutDashboard,
  Megaphone,
  Settings,
  Shield,
  Store,
  Users,
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "dashboard", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", href: "/users", label: "Usuarios", icon: Users },
  { id: "restaurants", href: "/restaurants", label: "Restaurantes", icon: Store },
  { id: "moderation", href: "/moderation", label: "Moderación", icon: Shield },
  { id: "analytics", href: "/analytics", label: "Analítica", icon: BarChart3 },
  { id: "finances", href: "/finances", label: "Finanzas", icon: CreditCard },
  { id: "support", href: "/support", label: "Soporte", icon: Headphones },
  { id: "verification", href: "/verification", label: "Verificación", icon: BadgeCheck },
  { id: "campaigns", href: "/campaigns", label: "Campañas", icon: Megaphone },
  { id: "settings", href: "/settings", label: "Configuración", icon: Settings },
  { id: "ai", href: "/ai", label: "Centro de IA", icon: Brain },
] as const;

export const NAV_BADGES: Record<string, string> = {
  moderation: "8",
  support: "24",
  verification: "3",
};
