import { CalendarCheck, Compass, Home, ShoppingBag, User } from "lucide-react";

export const NAV_ITEMS = [
  { id: "home", href: "/home", icon: Home, label: "Inicio" },
  { id: "discover", href: "/discover", icon: Compass, label: "Explorar" },
  { id: "reservations", href: "/reservations", icon: CalendarCheck, label: "Reservas" },
  { id: "orders", href: "/orders", icon: ShoppingBag, label: "Pedidos" },
  { id: "profile", href: "/profile", icon: User, label: "Perfil" },
] as const;

export type TabId = (typeof NAV_ITEMS)[number]["id"];
