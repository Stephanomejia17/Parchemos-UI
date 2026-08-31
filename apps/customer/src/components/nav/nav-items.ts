import { CalendarCheck, Compass, Home, ShoppingBag, Store, User, UsersRound } from "lucide-react";
import type { UserRole } from "@parchemos/shared/auth";

export const NAV_ITEMS = [
  { id: "home", href: "/home", icon: Home, label: "Inicio" },
  { id: "discover", href: "/discover", icon: Compass, label: "Explorar" },
  { id: "reservations", href: "/reservations", icon: CalendarCheck, label: "Reservas" },
  { id: "orders", href: "/orders", icon: ShoppingBag, label: "Pedidos" },
  { id: "profile", href: "/profile", icon: User, label: "Perfil" },
] as const;

const RESTAURANT_ITEM = { id: "restaurants", href: "/restaurants", icon: Store, label: "Restaurantes" } as const;
const STAFF_ITEM = { id: "staff", href: "/staff", icon: UsersRound, label: "Personal" } as const;

export function navItemsFor(role?: UserRole) {
  return role === "restaurante"
    ? [...NAV_ITEMS.slice(0, -1), RESTAURANT_ITEM, STAFF_ITEM, NAV_ITEMS[NAV_ITEMS.length - 1]]
    : NAV_ITEMS;
}

export type TabId = (typeof NAV_ITEMS)[number]["id"] | typeof RESTAURANT_ITEM.id | typeof STAFF_ITEM.id;
