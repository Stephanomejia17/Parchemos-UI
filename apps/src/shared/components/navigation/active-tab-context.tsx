"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { findActiveItem } from "@/shared/navigation/active-item";
import type { NavigationItem } from "@/shared/navigation/types";

const ActiveTabContext = createContext<string>("home");

export function ActiveTabProvider({
  items,
  children,
}: {
  items: NavigationItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("home");
  useEffect(() => {
    const active = findActiveItem(pathname, items);
    if (active) setActiveTab(active.id);
  }, [items, pathname]);
  return <ActiveTabContext.Provider value={activeTab}>{children}</ActiveTabContext.Provider>;
}

export function useActiveTab() {
  return useContext(ActiveTabContext);
}
