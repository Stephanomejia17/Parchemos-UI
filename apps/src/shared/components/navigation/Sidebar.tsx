"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { NavigationItem } from "@/shared/navigation/types";

export function Sidebar({
  items,
  activeId,
  user,
  onLogout,
  footer,
}: {
  items: NavigationItem[];
  activeId: string;
  user?: { fullName?: string | null; email?: string | null };
  onLogout?: () => void;
  footer?: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-border flex-shrink-0 transition-all ${collapsed ? "w-16" : "w-56 lg:w-60"}`}
    >
      <div className="h-16 flex items-center px-4 border-b border-border gap-3">
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
          <span>🍽️</span>
        </div>
        {!collapsed && (
          <span className="font-extrabold text-gray-900 text-lg font-heading">Parchemos</span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="ml-auto text-muted-foreground"
        >
          ☰
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {items.map(({ id, href, icon: Icon, label }) => (
          <Link
            key={id}
            href={href}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 ${activeId === id ? "bg-primary text-white" : "text-muted-foreground hover:bg-gray-100"}`}
          >
            <Icon className="h-4 w-4" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>
      {footer ??
        (!collapsed && (
          <button
            type="button"
            onClick={onLogout}
            className="border-t border-border p-3 text-left text-sm text-muted-foreground"
          >
            Cerrar sesión · {user?.fullName ?? "Mi cuenta"}
          </button>
        ))}
    </aside>
  );
}
