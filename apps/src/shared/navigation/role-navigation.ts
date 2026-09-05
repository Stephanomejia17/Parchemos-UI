import { CalendarCheck, Compass, Home, ShoppingBag, Store, User, UsersRound } from "lucide-react";
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
];

export function navigationForRole(role?: UserRole): NavigationItem[] {
  return role === "restaurante" ? RESTAURANT_NAVIGATION : CUSTOMER_NAVIGATION;
}
