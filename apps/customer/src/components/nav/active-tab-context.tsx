"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { navItemsFor, type TabId } from "./nav-items";
import { useAuth } from "@parchemos/shared/auth";

const ActiveTabContext = createContext<TabId>("home");

/**
 * Las pantallas de detalle (restaurant/menu/order-summary/profile/dashboard) no son tabs,
 * pero el nav debe seguir resaltando el último tab desde el que se entró — igual que en el
 * mock original, donde `activeTab` vivía separado de `screen`. Por eso solo se actualiza al
 * aterrizar en una ruta de tab real, nunca al entrar a una ruta de detalle.
 */
export function ActiveTabProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("home");

  useEffect(() => {
    const match = navItemsFor(user?.role).find(item => pathname === item.href || pathname.startsWith(`${item.href}/`));
    if (match) setActiveTab(match.id);
  }, [pathname, user?.role]);

  return <ActiveTabContext.Provider value={activeTab}>{children}</ActiveTabContext.Provider>;
}

export function useActiveTab() {
  return useContext(ActiveTabContext);
}
