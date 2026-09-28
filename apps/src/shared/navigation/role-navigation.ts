import {
  BadgeCheck,
  BarChart3,
  Brain,
  CalendarCheck,
  Compass,
  CreditCard,
  Headphones,
  Home,
  LayoutDashboard,
  Megaphone,
  Settings,
  Shield,
  ShoppingBag,
  Store,
  User,
  Users,
  UsersRound,
} from "lucide-react";
import type { UserRole } from "@/shared/auth";
import type { NavigationItem } from "./types";

const CUSTOMER_NAVIGATION: NavigationItem[] = [
  { id: "home", href: "/home", icon: Home, label: "Inicio" },
  { id: "discover", href: "/discover", icon: Compass, label: "Explorar" },
  { id: "reservations", href: "/reservations", icon: CalendarCheck, label: "Reservas" },
  { id: "orders", href: "/orders", icon: ShoppingBag, label: "Pedidos" },
  { id: "profile", href: "/profile", icon: User, label: "Perfil" },
];

const RESTAURANT_NAVIGATION: NavigationItem[] = [
  { id: "home", href: "/profile/dashboard", icon: Home, label: "Dashboard" },
  { id: "restaurants", href: "/restaurants", icon: Store, label: "Restaurantes" },
  { id: "staff", href: "/staff", icon: UsersRound, label: "Personal" },
  { id: "profile", href: "/restaurant-profile", icon: User, label: "Mi perfil" },
];

// TODO: los `badge` de abajo son valores fijos de demostración. Cuando el
// admin consuma la API real, deben calcularse a partir de los conteos
// devueltos por el backend (pendientes de moderación, tickets de soporte,
// verificaciones abiertas) en lugar de quedar quemados aquí.
const ADMIN_NAVIGATION: NavigationItem[] = [
  { id: "dashboard", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", href: "/users", label: "Usuarios", icon: Users },
  { id: "approvals", href: "/approvals", label: "Aprobaciones", icon: Store },
  { id: "moderation", href: "/moderation", label: "Moderación", icon: Shield, badge: "8" },
  { id: "analytics", href: "/analytics", label: "Analítica", icon: BarChart3 },
  { id: "finances", href: "/finances", label: "Finanzas", icon: CreditCard },
  { id: "support", href: "/support", label: "Soporte", icon: Headphones, badge: "24" },
  {
    id: "verification",
    href: "/verification",
    label: "Verificación",
    icon: BadgeCheck,
    badge: "3",
  },
  { id: "campaigns", href: "/campaigns", label: "Campañas", icon: Megaphone },
  { id: "settings", href: "/settings", label: "Configuración", icon: Settings },
  { id: "profile", href: "/account-profile", label: "Mi perfil", icon: User },
  { id: "ai", href: "/ai", label: "Centro de IA", icon: Brain },
];

/** `personal_restaurante` (workroom) aún no tiene features; se completa cuando existan. */
const WORKROOM_NAVIGATION: NavigationItem[] = [
  { id: "profile", href: "/staff_profile", icon: User, label: "Mi perfil" },
];

const DELIVERY_NAVIGATION: NavigationItem[] = [
  { id: "profile", href: "/delivery-profile", icon: User, label: "Mi perfil" },
];

const NAVIGATION_BY_ROLE: Partial<Record<UserRole, NavigationItem[]>> = {
  comensal: CUSTOMER_NAVIGATION,
  restaurante: RESTAURANT_NAVIGATION,
  administrador: ADMIN_NAVIGATION,
  personal_restaurante: WORKROOM_NAVIGATION,
  repartidor: DELIVERY_NAVIGATION,
  // `repartidor` no tiene rol de UI implementado todavía: cae en la navegación de comensal.
};

export function navigationForRole(role?: UserRole): NavigationItem[] {
  return (role && NAVIGATION_BY_ROLE[role]) || CUSTOMER_NAVIGATION;
}
