"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, type TabId } from "./nav-items";

const ActiveTabContext = createContext<TabId>("home");

/**
 * Las pantallas de detalle (restaurant/menu/order-summary/profile/dashboard) no son tabs,
 * pero el nav debe seguir resaltando el último tab desde el que se entró — igual que en el
 * mock original, donde `activeTab` vivía separado de `screen`. Por eso solo se actualiza al
 * aterrizar en una ruta de tab real, nunca al entrar a una ruta de detalle.
 */
export function ActiveTabProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabId>("home");

  useEffect(() => {
    const match = NAV_ITEMS.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`));
    if (match) setActiveTab(match.id);
  }, [pathname]);

  return <ActiveTabContext.Provider value={activeTab}>{children}</ActiveTabContext.Provider>;
}

export function useActiveTab() {
  return useContext(ActiveTabContext);
}
